import { Hono } from "hono";
import { authMiddleware, getAuthPayload } from "../middleware/auth";
import { piSessionManager } from "../pi/session-manager";

export const modelsRouter = new Hono();

modelsRouter.get("/", authMiddleware, (c) => {
  const { username } = getAuthPayload(c);
  const { modelRegistry } = piSessionManager.getUserContext(username);

  const available = modelRegistry.getAvailable();

  const models = available.map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider as string,
  }));

  return c.json({ models });
});
