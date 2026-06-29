import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgents } from "@/hooks/useAgents";
import type { AgentDefinition, AgentInfo } from "shared";

const STATUS_COLORS: Record<string, string> = {
  starting: "text-warning bg-warning/10 border-warning/30",
  idle: "text-accent bg-accent/10 border-accent/30",
  streaming: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  error: "text-error bg-error/10 border-error/30",
  stopped: "text-text-secondary bg-surface border-surface-hover",
};

const STATUS_DOT: Record<string, string> = {
  starting: "bg-warning animate-pulse",
  idle: "bg-accent",
  streaming: "bg-blue-400 animate-pulse",
  error: "bg-error",
  stopped: "bg-text-secondary",
};

const ROLE_COLORS: Record<string, string> = {
  "web-builder": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  researcher: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  supervisor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  default: "text-text-secondary bg-surface border-surface-hover",
};

function roleColor(role: string) {
  return ROLE_COLORS[role] ?? ROLE_COLORS.default;
}

const DEFAULT_FORM: AgentDefinition = {
  id: "",
  name: "",
  role: "",
  systemPrompt: "",
  model: "",
  skills: [],
  port: undefined,
};

function AgentCard({
  agent,
  onStop,
  onChat,
}: {
  agent: AgentInfo;
  onStop: (id: string) => void;
  onChat: (agent: { id: string; name: string }) => void;
}) {
  const [stopping, setStopping] = useState(false);

  const handleStop = async () => {
    setStopping(true);
    try {
      await onStop(agent.id);
    } finally {
      setStopping(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="bg-surface border border-surface-hover rounded-xl p-4 flex flex-col gap-3 hover:border-accent/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-accent">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text-primary text-sm truncate">{agent.name}</p>
            <p className="text-text-secondary text-xs font-mono truncate">{agent.id}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
            STATUS_COLORS[agent.status] ?? STATUS_COLORS.stopped
          }`}
        >
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[agent.status] ?? "bg-text-secondary"}`} />
            {agent.status}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleColor(agent.role)}`}>
          {agent.role}
        </span>
        {agent.port && (
          <span className="text-[10px] font-mono text-text-secondary bg-bg border border-surface-hover px-2 py-0.5 rounded-full">
            :{agent.port}
          </span>
        )}
        <span className="text-[10px] text-text-secondary ml-auto">
          {new Date(agent.createdAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => onChat({ id: agent.id, name: agent.name })}
          disabled={agent.status === "stopped" || agent.status === "error"}
          className="flex-1 py-1.5 px-3 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Abrir Chat
        </button>
        <button
          onClick={handleStop}
          disabled={stopping || agent.status === "stopped"}
          className="py-1.5 px-3 text-xs font-medium text-error border border-error/20 rounded-lg hover:bg-error/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stopping ? "Stopping..." : "Stop"}
        </button>
      </div>
    </motion.div>
  );
}

function RegisterModal({
  onClose,
  onRegister,
}: {
  onClose: () => void;
  onRegister: (def: AgentDefinition) => Promise<unknown>;
}) {
  const [form, setForm] = useState<AgentDefinition>(DEFAULT_FORM);
  const [skillsInput, setSkillsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const def: AgentDefinition = {
        ...form,
        id: form.id.trim().toLowerCase().replace(/\s+/g, "-"),
        skills: skillsInput
          ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        model: form.model?.trim() || undefined,
        port: form.port || undefined,
      };
      await onRegister(def);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to register agent");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof AgentDefinition) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-lg bg-surface border border-surface-hover rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-hover">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Register Agent</h2>
            <p className="text-xs text-text-secondary mt-0.5">Define a new programmatic agent</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">ID *</label>
              <input
                required
                value={form.id}
                onChange={set("id")}
                placeholder="web-builder"
                pattern="[a-z0-9-]+"
                title="lowercase letters, numbers, and dashes only"
                className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="Web Builder"
                className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Role *</label>
              <input
                required
                value={form.role}
                onChange={set("role")}
                placeholder="web-builder"
                className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Port (optional)</label>
              <input
                type="number"
                min={1024}
                max={65535}
                value={form.port || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    port: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="4200"
                className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Model (optional)</label>
            <input
              value={form.model || ""}
              onChange={set("model")}
              placeholder="anthropic/claude-3-5-sonnet-20241022"
              className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Skills (comma-separated)</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="github-deploy, cloudflare-deploy"
              className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">System Prompt *</label>
            <textarea
              required
              value={form.systemPrompt}
              onChange={set("systemPrompt")}
              rows={5}
              placeholder="You are an expert web developer specializing in React and TypeScript..."
              className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 resize-none font-mono leading-relaxed"
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-text-secondary border border-surface-hover rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 text-sm font-medium bg-accent text-bg rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Starting..." : "Register Agent"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}



interface AgentsPageProps {
  onSelectAgent?: (agent: { id: string; name: string }) => void;
}

export function AgentsPage({ onSelectAgent }: AgentsPageProps) {
  const { agents, loading, error, fetchAgents, registerAgent, stopAgent } = useAgents();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-surface flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Agents</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Programmatic agents — independent AI workers with isolated workspaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAgents}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
            title="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-bg rounded-lg hover:bg-accent/90 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Register Agent
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-32 text-error text-sm gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="opacity-60">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && agents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-text-secondary gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-surface-hover flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-text-secondary/50">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">No agents running</p>
              <p className="text-xs mt-1">Register your first agent to get started</p>
            </div>
            <button
              onClick={() => setShowRegister(true)}
              className="px-4 py-2 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
            >
              Register Agent
            </button>
          </div>
        )}

        {!loading && !error && agents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onStop={stopAgent}
                  onChat={(agentObj) => onSelectAgent?.(agentObj)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onRegister={registerAgent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
