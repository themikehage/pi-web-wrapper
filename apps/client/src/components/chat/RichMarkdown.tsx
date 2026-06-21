import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  content: string;
}

export function RichMarkdown({ content }: Props) {
  return (
    <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed font-sans">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const inline = !match;
            const codeString = String(children).replace(/\n$/, "");

            if (inline) {
              return (
                <code
                  className="bg-surface-hover/80 text-accent font-mono px-1.5 py-0.5 rounded text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="my-3 rounded-lg overflow-hidden border border-surface-hover shadow-md font-mono text-xs">
                <div className="bg-surface px-3 py-1.5 border-b border-surface-hover text-[10px] text-text-secondary flex justify-between items-center">
                  <span>{match ? match[1] : "code"}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeString)}
                    className="hover:text-text-primary transition-colors text-[10px]"
                  >
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={match ? match[1] : "text"}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    background: "#171717",
                    padding: "0.75rem",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0 break-words">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="break-words">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-base font-bold text-text-primary mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-sm font-bold text-text-primary mt-3 mb-2">{children}</h2>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-accent/40 pl-3 my-2 text-text-secondary/80 italic">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
