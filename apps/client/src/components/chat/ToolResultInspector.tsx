import { useState } from "react";
import { HtmlPreview } from "./HtmlPreview";
import { ImageGrid } from "./ImageGrid";

interface Props {
  toolName: string;
  args?: Record<string, unknown>;
  result: string | unknown;
  sessionId: string | null;
}

// Parses results for HTML documents
function isHtml(text: string): boolean {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    (trimmed.includes("<head") && trimmed.includes("</html"))
  );
}

// Parses result text to extract image URLs and headers
function extractImages(text: string): Array<{ url: string; title?: string }> {
  if (typeof text !== "string") return [];

  const images: Array<{ url: string; title?: string }> = [];

  // Match: === Title.jpg ===\nhttp://...
  const markerRegex = /===\s*([^\n]+?)\s*===\s*\n(https?:\/\/[^\s]+|[\w/\\:.-]+\.(?:jpg|jpeg|png|webp|gif))/gi;
  let match;
  while ((match = markerRegex.exec(text)) !== null) {
    images.push({ title: match[1], url: match[2] });
  }

  // Also match any raw images listed: file: ... or image: ...
  const urlRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|webp|gif))/gi;
  const rawMatches = text.match(urlRegex) ?? [];
  for (const url of rawMatches) {
    if (!images.some((img) => img.url === url)) {
      images.push({ url });
    }
  }

  // Local filesystem path matching (e.g. C:\tmp\...)
  const localRegex = /(?:[a-zA-Z]:[\\/]|[\/])(?:[\w.-]+[\\/])+\w+\.(?:jpg|jpeg|png|webp|gif)/gi;
  const localMatches = text.match(localRegex) ?? [];
  for (const path of localMatches) {
    if (!images.some((img) => img.url === path)) {
      const fileName = path.split(/[\\/]/).pop();
      images.push({ url: path, title: fileName });
    }
  }

  return images;
}

export function ToolResultInspector({ toolName, args, result, sessionId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const resultStr = typeof result === "string"
    ? result
    : JSON.stringify(result, null, 2) ?? "";

  const images = extractImages(resultStr);
  const htmlOutput = isHtml(resultStr) ? resultStr : null;

  return (
    <div className="w-full my-1 rounded-lg border border-surface-hover bg-surface overflow-hidden text-xs font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-hover/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
          <span className="font-mono font-semibold text-text-primary truncate">{toolName}</span>
          <span className="text-[10px] text-text-secondary/50">executed</span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`text-text-secondary transition-transform ${isOpen ? "rotate-90" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-surface-hover">
          {args && Object.keys(args).length > 0 && (
            <div className="px-3 py-1.5 bg-[#171717]/40 border-b border-surface-hover/40 text-[10px] text-text-secondary font-mono break-all">
              <span className="text-text-secondary/50">params:</span>{" "}
              {JSON.stringify(args)}
            </div>
          )}

          <div className="p-3 space-y-3">
            {htmlOutput ? (
              <HtmlPreview html={htmlOutput} />
            ) : (
              <pre className="whitespace-pre-wrap break-words text-text-secondary text-[11px] font-mono leading-relaxed bg-[#171717]/40 p-2.5 rounded-md max-h-96 overflow-y-auto">
                {resultStr}
              </pre>
            )}

            {images.length > 0 && (
              <div className="pt-2">
                <div className="text-[10px] font-semibold text-text-secondary/70 uppercase tracking-wider mb-1.5">
                  Extracted Images
                </div>
                <ImageGrid images={images} sessionId={sessionId} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
