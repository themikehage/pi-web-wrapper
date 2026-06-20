import { AuthProvider } from "@/contexts/AuthContext";
import { AppRouter } from "@/components/layout/AppRouter";

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
