import { useState } from "react";

interface Props {
  html: string;
}

export function HtmlPreview({ html }: Props) {
  const [showHtml, setShowHtml] = useState(true);

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-surface-hover shadow-md text-xs bg-surface font-sans">
      <div className="bg-surface-hover/30 px-3 py-2 border-b border-surface-hover flex justify-between items-center">
        <span className="font-semibold text-text-secondary text-[11px] uppercase tracking-wider">
          HTML Document Output
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHtml(true)}
            className={`px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer ${
              showHtml
                ? "bg-accent/20 text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setShowHtml(false)}
            className={`px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer ${
              !showHtml
                ? "bg-accent/20 text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Source Code
          </button>
        </div>
      </div>
      {showHtml ? (
        <div className="bg-white p-1 h-80 relative">
          <iframe
            srcDoc={html}
            title="HTML output preview"
            sandbox="allow-scripts allow-forms"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      ) : (
        <pre className="p-3 max-h-80 overflow-y-auto overflow-x-auto text-[10px] text-text-secondary font-mono leading-normal bg-[#171717]">
          {html}
        </pre>
      )}
    </div>
  );
}
