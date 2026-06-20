import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface Props {
  onSend: (message: string) => void;
  onAbort: () => void;
  streaming: boolean;
}

export function InputArea({ onSend, onAbort, streaming }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-surface p-3 sm:p-4">
      <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={streaming}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-surface border border-surface-hover rounded-lg
                     text-text-primary placeholder-text-secondary outline-none
                     resize-none focus:border-accent transition-colors
                     font-mono text-xs sm:text-sm"
        />
        {streaming ? (
          <button
            onClick={onAbort}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-error text-white rounded-lg hover:opacity-90
                       transition-opacity flex-shrink-0 font-semibold text-xs sm:text-sm"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-accent text-bg rounded-lg hover:opacity-90
                       disabled:opacity-50 transition-opacity flex-shrink-0 font-semibold text-xs sm:text-sm"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
