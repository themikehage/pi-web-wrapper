import { useState, useEffect, useCallback } from "react";

interface ProviderInfo {
  id: string;
  name: string;
  authStatus: { configured: boolean; source?: string };
  models: Array<{ id: string; name: string; reasoning: boolean }>;
}

export function SettingsPage({ onClose }: { onClose: () => void }) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/providers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load providers");
      const data = await res.json();
      setProviders(data.providers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading providers");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSaveKey = async () => {
    if (!selectedProvider || !apiKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/providers/${selectedProvider}/key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey }),
      });
      if (!res.ok) throw new Error("Failed to save API key");
      setApiKey("");
      setSelectedProvider(null);
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving key");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async (providerId: string) => {
    try {
      const res = await fetch(`/api/providers/${providerId}/key`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove API key");
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing key");
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-bg">
      <header className="h-10 sm:h-12 flex items-center justify-between px-3 sm:px-4 border-b border-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="sm:w-5 sm:h-5">
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-text-primary text-sm">Settings</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-3 sm:p-6 space-y-6">
          <div>
            <h2 className="text-text-primary font-semibold text-base mb-4">Providers</h2>
            {error && (
              <p className="text-error text-sm mb-4 p-3 bg-surface rounded-lg">{error}</p>
            )}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface rounded-lg p-3 sm:p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          p.authStatus.configured ? "bg-success" : "bg-surface-hover"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-text-primary text-sm font-medium truncate">
                          {p.name}
                        </div>
                        <div className="text-text-secondary text-xs">
                          {p.models.length} model{p.models.length !== 1 ? "s" : ""}{" "}
                          {p.authStatus.configured
                            ? `- ${p.authStatus.source ?? "configured"}`
                            : "- no key set"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {p.authStatus.configured ? (
                        <button
                          onClick={() => handleRemoveKey(p.id)}
                          className="text-xs text-text-secondary hover:text-error transition-colors px-2 py-1"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedProvider(p.id);
                            setApiKey("");
                            setError("");
                          }}
                          className="text-xs bg-accent text-bg font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Add Key
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg w-full max-w-sm p-4 sm:p-6 space-y-4">
            <h3 className="text-text-primary font-semibold text-sm">
              Set API Key for {providers.find((p) => p.id === selectedProvider)?.name}
            </h3>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              autoFocus
              className="w-full px-3 py-2 bg-bg border border-surface-hover rounded-lg
                         text-text-primary placeholder-text-secondary outline-none
                         focus:border-accent transition-colors text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveKey();
                if (e.key === "Escape") setSelectedProvider(null);
              }}
            />
            {error && <p className="text-error text-xs">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                disabled={saving || !apiKey.trim()}
                className="px-4 py-2 text-sm bg-accent text-bg font-semibold rounded-lg
                           hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
