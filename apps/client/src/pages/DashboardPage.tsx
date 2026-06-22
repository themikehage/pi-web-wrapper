import { useState, useEffect } from "react";

interface RepoItem {
  name: string;
  path: string;
  lastModified: string;
}

interface Props {
  onSelectRepo: (repoName: string | null) => void;
}

export function DashboardPage({ onSelectRepo }: Props) {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [cloneUrl, setCloneUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/workspace-repos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await res.json();
      setRepos(data.repos || []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/workspace-repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: repoName.trim(),
          cloneUrl: cloneUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create project");
      }

      await fetchRepos();
      setShowModal(false);
      setRepoName("");
      setCloneUrl("");
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-surface pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Dashboard de Proyectos</h1>
            <p className="text-sm text-text-secondary mt-1">
              Selecciona un repositorio para trabajar de forma aislada o usa el workspace global en la raíz.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onSelectRepo(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-surface hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
            >
              Workspace Global (Raíz)
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-accent hover:opacity-90 text-bg rounded-lg text-sm font-semibold transition-opacity cursor-pointer font-bold"
            >
              + Nuevo Proyecto
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-text-secondary mt-4">Cargando repositorios...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div
                key={repo.name}
                className="bg-surface border border-surface-hover hover:border-accent/40 rounded-xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-surface-hover">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg text-text-primary truncate">{repo.name}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-4">
                    Última modificación: {new Date(repo.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onSelectRepo(repo.name)}
                  className="w-full mt-6 py-2 bg-surface-hover hover:bg-accent hover:text-bg text-text-primary rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  Abrir Proyecto
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            ))}

            {repos.length === 0 && (
              <div className="col-span-full bg-surface border border-surface-hover border-dashed rounded-xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-secondary" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary text-lg">No hay proyectos locales</h3>
                <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                  Inicializa un proyecto vacío o clona uno existente de Git para empezar a trabajar con el agente.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-6 px-4 py-2 bg-accent hover:opacity-90 text-bg rounded-lg text-sm font-semibold transition-opacity cursor-pointer font-bold"
                >
                  Crear primer proyecto
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-surface-hover rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-text-primary mb-4">Nuevo Proyecto / Repositorio</h2>
            <form onSubmit={handleCreateRepo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. mi-app-web"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-surface-hover rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  URL de Clonación Git (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. https://github.com/usuario/repo.git"
                  value={cloneUrl}
                  onChange={(e) => setCloneUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-surface-hover rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {submitError && (
                <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-xs">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setRepoName("");
                    setCloneUrl("");
                    setSubmitError(null);
                  }}
                  className="px-4 py-2 border border-surface-hover rounded-lg text-sm hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-accent hover:opacity-90 disabled:opacity-50 text-bg rounded-lg text-sm font-semibold transition-opacity cursor-pointer font-bold"
                >
                  {submitting ? "Creando..." : "Crear Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
