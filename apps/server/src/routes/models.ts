import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

export const modelsRouter = new Hono();

modelsRouter.get("/", authMiddleware, async (c) => {
  const models = [
    {
      id: "claude-sonnet-4-20250514",
      name: "Claude Sonnet 4",
      provider: "anthropic",
    },
    {
      id: "claude-opus-4-20250514",
      name: "Claude Opus 4",
      provider: "anthropic",
    },
    {
      id: "claude-haiku-3-5-20241022",
      name: "Claude Haiku 3.5",
      provider: "anthropic",
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "openai",
    },
  ];

  return c.json({ models });
});
