import { createAgentServer } from "./create-agent-server";
import type { AgentDefinition, AgentInfo, AgentStatus } from "shared";
import type { AgentEntry } from "./types";

class AgentRegistry {
  private agents = new Map<string, AgentEntry>();

  async register(definition: AgentDefinition): Promise<AgentEntry> {
    if (this.agents.has(definition.id)) {
      throw new Error(`Agent "${definition.id}" is already registered`);
    }

    const entry: AgentEntry = {
      server: null as any,
      status: "starting",
      createdAt: new Date().toISOString(),
    };
    this.agents.set(definition.id, entry);

    try {
      const server = await createAgentServer(definition);
      entry.server = server;
      entry.status = "idle";

      server.session.subscribe((event) => {
        if (event.type === "agent_start") entry.status = "streaming";
        if (event.type === "agent_end") entry.status = "idle";
      });

      return entry;
    } catch (err) {
      entry.status = "error";
      this.agents.delete(definition.id);
      throw err;
    }
  }

  get(id: string): AgentEntry | undefined {
    return this.agents.get(id);
  }

  list(): AgentInfo[] {
    const result: AgentInfo[] = [];
    for (const [id, entry] of this.agents) {
      result.push({
        id,
        name: entry.server.definition.name,
        role: entry.server.definition.role,
        status: entry.status,
        port: entry.server.definition.port,
        createdAt: entry.createdAt,
      });
    }
    return result;
  }

  async stop(id: string): Promise<void> {
    const entry = this.agents.get(id);
    if (!entry) return;
    entry.status = "stopped";
    await entry.server.stop();
    this.agents.delete(id);
  }

  async stopAll(): Promise<void> {
    for (const id of [...this.agents.keys()]) {
      await this.stop(id);
    }
  }

  setStatus(id: string, status: AgentStatus): void {
    const entry = this.agents.get(id);
    if (entry) entry.status = status;
  }
}

export const agentRegistry = new AgentRegistry();
