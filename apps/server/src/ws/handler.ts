import jwt from "jsonwebtoken";
import { piSessionManager } from "../pi/session-manager";
import type { AuthPayload } from "../middleware/auth";

interface PiWebSocket {
  wsId: string;
  user: AuthPayload;
}

let wsCounter = 0;

export function onOpen(_evt: Event, _ws: unknown) {
  const ws = _ws as unknown as PiWebSocket;
  ws.wsId = String(++wsCounter);
}

export function onClose(_evt: Event, _ws: unknown) {}

export async function onMessage(evt: MessageEvent<string>, _ws: unknown) {
  const ws = _ws as unknown as PiWebSocket;
  let data: Record<string, unknown>;

  try {
    data = JSON.parse(evt.data);
  } catch {
    return;
  }

  const wsRaw = _ws as unknown as { send: (data: string) => void; close: () => void };

  if (data.type === "auth") {
    try {
      const user = jwt.verify(
        data.token as string,
        process.env.JWT_SECRET!
      ) as AuthPayload;
      ws.user = user;
      wsRaw.send(JSON.stringify({ type: "auth_success", wsId: ws.wsId }));
    } catch {
      wsRaw.send(JSON.stringify({ type: "auth_error", error: "Invalid token" }));
      wsRaw.close();
    }
    return;
  }

  if (!ws.user) {
    wsRaw.send(JSON.stringify({ type: "error", error: "Not authenticated" }));
    return;
  }

  if (data.type === "prompt") {
    const sessionId = data.sessionId as string;
    const message = data.message as string;

    const session = await piSessionManager.getOrCreateSession(
      ws.user.username,
      sessionId
    );

    const unsubscribe = session.subscribe((agentEvent) => {
      wsRaw.send(JSON.stringify(agentEvent));
    });

    try {
      await session.prompt(message);
    } catch (error) {
      wsRaw.send(
        JSON.stringify({ type: "agent_error", sessionId, error: String(error) })
      );
    }

    unsubscribe();
  }

  if (data.type === "steer") {
    const sessionId = data.sessionId as string;
    const message = data.message as string;
    const session = piSessionManager.getSession(ws.user.username, sessionId);
    if (session) {
      session.steer(message);
    }
  }

  if (data.type === "follow_up") {
    const sessionId = data.sessionId as string;
    const message = data.message as string;
    const session = piSessionManager.getSession(ws.user.username, sessionId);
    if (session) {
      session.followUp(message);
    }
  }

  if (data.type === "abort") {
    const sessionId = data.sessionId as string;
    const session = piSessionManager.getSession(ws.user.username, sessionId);
    if (session) {
      await session.abort();
      wsRaw.send(JSON.stringify({ type: "aborted", sessionId }));
    }
  }
}
