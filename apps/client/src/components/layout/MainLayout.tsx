import { SessionSidebar } from "@/components/sidebar/SessionSidebar";
import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Route } from "@/hooks/useRouter";
import type { ChannelMember, AgentInfo, AddMember, UpdateMember } from "shared";
import { ChannelMembersModal } from "@/components/channels/ChannelMembersModal";

interface Props {
  route: Route;
  onNavigate: (path: string) => void;
  activeRepoName: string | null;
  activeAgent: { id: string; name: string } | null;
  activeChannel: { id: string; name: string } | null;
  children: ReactNode;
}

export function MainLayout({ route, onNavigate, activeRepoName, activeAgent, activeChannel = null, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([]);
  const [registeredAgents, setRegisteredAgents] = useState<AgentInfo[]>([]);
  const pendingWorkspaceFile = useRef<string | null>(null);

  const fetchChannelData = useCallback(async () => {
    if (!activeChannel) return;
    const token = localStorage.getItem("token");
    try {
      const [chRes, agRes] = await Promise.all([
        fetch(`/api/channels/${activeChannel.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/agents", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (chRes.ok) {
        const data = await chRes.json();
        setChannelMembers(data.channel.members || []);
      }
      if (agRes.ok) {
        const data = await agRes.json();
        setRegisteredAgents(data.agents || []);
      }
    } catch {}
  }, [activeChannel]);

  useEffect(() => {
    if (showMembersModal) {
      fetchChannelData();
    }
  }, [showMembersModal, fetchChannelData]);

  const handleAddMember = async (data: AddMember) => {
    if (!activeChannel) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/channels/${activeChannel.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    await fetchChannelData();
  };

  const handleUpdateMember = async (agentId: string, data: UpdateMember) => {
    if (!activeChannel) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/channels/${activeChannel.id}/members/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    await fetchChannelData();
  };

  const handleRemoveMember = async (agentId: string) => {
    if (!activeChannel) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/channels/${activeChannel.id}/members/${agentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchChannelData();
  };

  useEffect(() => {
    const handleOpenWorkspace = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path ?? null;
      if (route.page !== "workspace") {
        pendingWorkspaceFile.current = path;
        onNavigate("/workspace");
      }
    };
    window.addEventListener("openWorkspaceFile", handleOpenWorkspace);
    return () => {
      window.removeEventListener("openWorkspaceFile", handleOpenWorkspace);
    };
  }, [onNavigate, route.page]);

  useEffect(() => {
    if (route.page === "workspace" && pendingWorkspaceFile.current) {
      const path = pendingWorkspaceFile.current;
      pendingWorkspaceFile.current = null;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("openWorkspaceFile", { detail: { path } }));
      }, 150);
    }
  }, [route.page]);

  const handleSelectSession = useCallback((id: string) => {
    if (id) {
      onNavigate(`/session/${id}`);
    } else {
      onNavigate("/");
    }
    setSidebarOpen(false);
  }, [onNavigate]);

  const handleNewSession = useCallback((id: string) => {
    onNavigate(`/session/${id}`);
    setSidebarOpen(false);
  }, [onNavigate]);

  const handleOpenSettings = useCallback(() => {
    onNavigate("/settings");
  }, [onNavigate]);

  const handleOpenSkills = useCallback(() => {
    onNavigate("/skills");
  }, [onNavigate]);

  const isChat = route.page === "chat";
  const sessionId = route.page === "chat" ? route.sessionId : null;

  const getPageName = () => {
    const contextName = activeChannel
      ? `Channel: #${activeChannel.name}`
      : activeAgent
      ? `Agent: ${activeAgent.name}`
      : activeRepoName
      ? `${activeRepoName}`
      : "Global";
    switch (route.page) {
      case "projects":
        return "Proyectos";
      case "settings":
        return `Settings [${contextName}]`;
      case "skills":
        return `Skills [${contextName}]`;
      case "workspace":
        return `Workspace [${contextName}]`;
      case "preview":
        return `Preview [${activeRepoName || "?"}]`;
      case "agents":
        return "Agents";
      case "channels":
        return "Channels";
      case "channel":
        return "Channel";
      default:
        return `Chat [${contextName}]`;
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-bg text-text-primary overflow-hidden font-sans">
      <header className="h-10 sm:h-12 border-b border-surface px-2 sm:px-4 flex items-center justify-between flex-shrink-0 bg-surface/30">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isChat && (
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="sm:hidden p-1 text-text-secondary hover:text-text-primary rounded"
              title="Toggle sessions"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <span className="font-semibold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent inline-block" />
            {getPageName()}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {activeChannel && (
            <button
              onClick={() => setShowMembersModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-400/10 text-purple-400 border border-purple-400/30 rounded-lg hover:bg-purple-400/20 transition-colors"
              title="Gestionar miembros del canal"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Miembros</span>
            </button>
          )}
          <button
            onClick={() => onNavigate("/projects")}
            className={`p-1 cursor-pointer transition-colors ${
              route.page === "projects"
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
            title="Projects"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M7 3a1 1 0 000 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L12.586 3H7z" />
              <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-1 1H16v8H4V6h1.586l-1-1H4z" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate("/workspace")}
            className={`p-1 cursor-pointer transition-colors ${
              route.page === "workspace"
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
            title="Workspace"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </button>
          {activeRepoName && (
            <button
              onClick={() => onNavigate("/preview")}
              className={`p-1 cursor-pointer transition-colors ${
                route.page === "preview"
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Preview"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onNavigate("/agents")}
            className={`p-1 cursor-pointer transition-colors ${
              route.page === "agents"
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
            title="Agents"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate("/channels")}
            className={`p-1 cursor-pointer transition-colors font-bold text-sm ${
              route.page === "channels" || route.page === "channel"
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
            title="Channels"
          >
            #
          </button>
          <button
            onClick={handleOpenSkills}
            className={`p-1 cursor-pointer transition-colors ${
              route.page === "skills"
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
            title="Skills Library"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </button>
          <button
            onClick={handleOpenSettings}
            className={`p-1 cursor-pointer transition-colors ${
              route.page === "settings"
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`}
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="sm:w-[18px] sm:h-[18px]">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 relative">
        {isChat && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {isChat && (
          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed sm:relative sm:translate-x-0 z-50 sm:z-auto w-64 sm:w-64 flex-shrink-0 h-full border-r border-surface bg-bg transition-transform duration-200`}
          >
            <SessionSidebar
              activeSessionId={sessionId}
              activeRepoName={activeRepoName}
              activeAgent={activeAgent}
              activeChannel={activeChannel}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
            />
          </aside>
        )}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {showMembersModal && activeChannel && (
        <ChannelMembersModal
          channelName={activeChannel.name}
          members={channelMembers}
          registeredAgents={registeredAgents}
          onClose={() => setShowMembersModal(false)}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
}
