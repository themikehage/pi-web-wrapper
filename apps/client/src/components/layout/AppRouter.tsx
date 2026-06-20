import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ChatLayout } from "./ChatLayout";

export function AppRouter() {
  const { token, user, loading } = useAuth();
  const [page, setPage] = useState<"chat" | "settings">("chat");

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage />;
  }

  if (page === "settings") {
    return <SettingsPage onClose={() => setPage("chat")} />;
  }

  return <ChatLayout onOpenSettings={() => setPage("settings")} />;
}
