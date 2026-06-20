import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware, getAuthPayload } from "../middleware/auth";
import { piSessionManager } from "../pi/session-manager";
import { CreateSessionSchema, PromptSchema, ModelSettingsSchema } from "shared";

const STORAGE_KEY = "pi-web-sessions";

export const sessionsRouter = new Hono();

sessionsRouter.use("/*", authMiddleware);

sessionsRouter.get("/", (c) => {
  return c.json({ sessions: [] });
});

sessionsRouter.post("/", zValidator("json", CreateSessionSchema), async (c) => {
  const { name } = c.req.valid("json");
  const { username } = getAuthPayload(c);
  const sessionId = crypto.randomUUID();

  const session = {
    id: sessionId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
  };

  await piSessionManager.getOrCreateSession(username, sessionId);

  return c.json(session, 201);
});

sessionsRouter.post("/:id/prompt", zValidator("json", PromptSchema), async (c) => {
  const sessionId = c.req.param("id");
  const { message } = c.req.valid("json");
  const { username } = getAuthPayload(c);

  const session = await piSessionManager.getOrCreateSession(username, sessionId);

  try {
    await session.prompt(message);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

sessionsRouter.get("/:id/messages", async (c) => {
  const sessionId = c.req.param("id");
  const { username } = getAuthPayload(c);

  const session = piSessionManager.getSession(username, sessionId);
  if (!session) {
    return c.json({ messages: [] });
  }

  return c.json({ messages: session.messages });
});

sessionsRouter.post("/:id/abort", async (c) => {
  const sessionId = c.req.param("id");
  const { username } = getAuthPayload(c);

  const session = piSessionManager.getSession(username, sessionId);
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  await session.abort();

  return c.json({ success: true });
});

sessionsRouter.delete("/:id", async (c) => {
  const sessionId = c.req.param("id");
  const { username } = getAuthPayload(c);

  await piSessionManager.destroySession(username, sessionId);

  return c.json({ success: true });
});

sessionsRouter.post(
  "/:id/model",
  zValidator("json", ModelSettingsSchema),
  async (c) => {
    const sessionId = c.req.param("id");
    const { provider, modelId, thinkingLevel } = c.req.valid("json");
    const { username } = getAuthPayload(c);
    const { modelRegistry } = piSessionManager.getUserContext(username);

    const model = modelRegistry.find(provider, modelId);
    if (!model) {
      return c.json({ error: "Model not found" }, 404);
    }

    const session = piSessionManager.getSession(username, sessionId);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    await session.setModel(model);
    if (thinkingLevel) {
      session.setThinkingLevel(thinkingLevel);
    }

    return c.json({ success: true, model: { id: model.id, name: model.name, provider: model.provider as string } });
  }
);
