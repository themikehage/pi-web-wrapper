import { useAuth } from "@/contexts/AuthContext";
import { SessionSidebar } from "@/components/sidebar/SessionSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useState } from "react";

export function ChatLayout() {
  const { user, logout } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-bg">
      <header className="h-12 flex items-center justify-between px-4 border-b border-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-text-primary text-sm">Pi Web</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-secondary text-sm">{user?.username}</span>
          <button
            onClick={logout}
            className="text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 border-r border-surface">
            <SessionSidebar
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              onNewSession={(id) => setActiveSessionId(id)}
            />
          </aside>
        )}
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
