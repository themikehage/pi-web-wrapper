import { useAuth } from "@/contexts/AuthContext";
import { SessionSidebar } from "@/components/sidebar/SessionSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useState, useCallback } from "react";

export function ChatLayout() {
  const { user, logout } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
  }, []);

  const handleNewSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-bg">
      <header className="h-10 sm:h-12 flex items-center justify-between px-3 sm:px-4 border-b border-surface flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="sm:w-5 sm:h-5">
              <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-text-primary text-xs sm:text-sm">Pi Web</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-text-secondary text-sm">{user?.username}</span>
          <button
            onClick={logout}
            className="text-text-secondary hover:text-text-primary text-xs sm:text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed sm:relative sm:translate-x-0 z-50 sm:z-auto w-64 sm:w-64 flex-shrink-0 h-full border-r border-surface bg-bg transition-transform duration-200`}
        >
          <SessionSidebar
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
          />
        </aside>
        <main className="flex-1 min-w-0">
          <ChatArea
            key={activeSessionId}
            sessionId={activeSessionId}
          />
        </main>
      </div>
    </div>
  );
}
