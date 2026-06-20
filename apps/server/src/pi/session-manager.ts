import {
  createAgentSession,
  AuthStorage,
  ModelRegistry,
  SessionManager,
  type AgentSession,
  type AgentSessionEvent,
} from "@earendil-works/pi-coding-agent";
import { existsSync, mkdirSync } from "node:fs";

interface UserSessionEntry {
  session: AgentSession;
  unsubscribe: () => void;
}

class PiSessionManager {
  private sessions = new Map<string, UserSessionEntry>();

  private getSessionKey(username: string, sessionId: string): string {
    return `${username}:${sessionId}`;
  }

  private ensureUserDir(username: string): string {
    const dir = `/tmp/pi-web-users/${username}`;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async getOrCreateSession(
    username: string,
    sessionId: string
  ): Promise<AgentSession> {
    const key = this.getSessionKey(username, sessionId);
    const existing = this.sessions.get(key);
    if (existing) return existing.session;

    const userDir = this.ensureUserDir(username);
    const sessionDir = `${userDir}/sessions/${sessionId}`;

    if (!existsSync(sessionDir)) {
      mkdirSync(sessionDir, { recursive: true });
    }

    const authStorage = AuthStorage.create(`${userDir}/auth.json`);
    const modelRegistry = ModelRegistry.create(authStorage);

    const { session } = await createAgentSession({
      cwd: sessionDir,
      sessionManager: SessionManager.create(sessionDir),
      authStorage,
      modelRegistry,
    });

    const unsubscribe = session.subscribe(() => {});

    this.sessions.set(key, {
      session,
      unsubscribe,
    });

    return session;
  }

  getSession(username: string, sessionId: string): AgentSession | null {
    const key = this.getSessionKey(username, sessionId);
    return this.sessions.get(key)?.session ?? null;
  }

  subscribeToSession(
    username: string,
    sessionId: string,
    listener: (event: AgentSessionEvent) => void
  ): () => void {
    const key = this.getSessionKey(username, sessionId);
    const entry = this.sessions.get(key);
    if (!entry) return () => {};

    const unsubscribe = entry.session.subscribe(listener);
    return unsubscribe;
  }

  subscribeOnce(
    username: string,
    sessionId: string,
    listener: (event: AgentSessionEvent) => void
  ): void {
    const key = this.getSessionKey(username, sessionId);
    const entry = this.sessions.get(key);
    if (!entry) return;

    let called = false;
    const unsubscribe = entry.session.subscribe((event) => {
      if (!called) {
        called = true;
        listener(event);
      }
    });

    entry.unsubscribe = () => {
      unsubscribe();
      if (!called) {
        called = true;
        listener({ type: "" } as AgentSessionEvent);
      }
    };
  }

  async destroySession(username: string, sessionId: string): Promise<void> {
    const key = this.getSessionKey(username, sessionId);
    const entry = this.sessions.get(key);
    if (entry) {
      entry.unsubscribe();
      entry.session.dispose();
      this.sessions.delete(key);
    }
  }

  async destroyAllSessions(username: string): Promise<void> {
    const prefix = `${username}:`;
    for (const [key, entry] of this.sessions) {
      if (key.startsWith(prefix)) {
        entry.unsubscribe();
        entry.session.dispose();
        this.sessions.delete(key);
      }
    }
  }
}

export const piSessionManager = new PiSessionManager();
