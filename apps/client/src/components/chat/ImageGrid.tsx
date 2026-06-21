interface ImageItem {
  url: string;
  title?: string;
}

interface Props {
  images: ImageItem[];
  sessionId: string | null;
}

export function resolveImageUrl(url: string, sessionId: string | null): string {
  if (!url) return "";

  if (url.startsWith("data:image/") || url.startsWith("http://") || url.startsWith("https://")) {
    // If it's a wikimedia image, some user agents are blocked, but direct browser requests should load fine
    return url;
  }

  // Resolve local paths like /tmp/pi-web-users/ or C:\tmp\pi-web-users\
  if (sessionId && (url.includes("/tmp/") || url.includes("C:\\tmp\\") || url.includes("C:/tmp/"))) {
    const sessionMarker = `sessions/${sessionId}/`;
    const idx = url.indexOf(sessionMarker);
    if (idx !== -1) {
      const relativePath = url.substring(idx + sessionMarker.length);
      const cleanedPath = relativePath.replace(/\\/g, "/");
      return `/api/sessions/${sessionId}/files/${cleanedPath}`;
    }

    // Fallback search for any sessions/id/ part
    const match = url.match(/sessions\/([a-zA-Z0-9-]+)\/(.+)/);
    if (match) {
      const cleanedPath = match[2].replace(/\\/g, "/");
      return `/api/sessions/${match[1]}/files/${cleanedPath}`;
    }

    // Fallback if the path is relative to session directory (just a filename)
    const baseName = url.split(/[\\/]/).pop();
    if (baseName) {
      return `/api/sessions/${sessionId}/files/${baseName}`;
    }
  }

  return url;
}

export function ImageGrid({ images, sessionId }: Props) {
  if (images.length === 0) return null;

  return (
    <div className="my-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-full font-sans">
      {images.map((img, i) => {
        const resolved = resolveImageUrl(img.url, sessionId);
        return (
          <div
            key={i}
            className="group relative rounded-lg overflow-hidden border border-surface-hover bg-surface hover:border-accent/40 shadow-sm transition-all"
          >
            <div className="aspect-square w-full overflow-hidden bg-black/10 flex items-center justify-center">
              <img
                src={resolved}
                alt={img.title || "Image content"}
                loading="lazy"
                onError={(e) => {
                  // Fallback visual indicator on error
                  (e.target as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            {img.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-[10px] text-text-primary truncate">
                {img.title}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
