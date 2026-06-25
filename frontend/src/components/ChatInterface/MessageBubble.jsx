import ReactMarkdown from 'react-markdown'
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import highlight from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'

const renderer = {
  code({ node, ...props }) {
    const { children } = props
    const className = node.properties.className || ''
    const language = className.replace('language-', '') || 'plaintext'

    let highlighted
    try {
      highlighted = highlight.highlight(children, { language }).value
    } catch {
      highlighted = children
    }

    const codeId = `code-${Math.random().toString(36).slice(2)}`
    const [copied, setCopied] = useState(false)

    return (
      <div className="relative group" data-code-id={codeId}>
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-deep)] border-b border-white/10">
          <span className="text-xs text-[var(--text-muted)] font-medium">{language}</span>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(children)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Copy code"
          >
            <Copy size={14} className={copied ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
          </button>
        </div>
        <pre className="p-4 overflow-x-auto"><code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
      </div>
    )
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-3 border-[var(--accent)] pl-4 my-3 italic text-[var(--text-muted)]">
        {children}
      </blockquote>
    )
  },
}

export default function MessageBubble({ message, isStreaming = false }) {
  const { role, content, toolCalls, toolResults } = message
  const isUser = role === 'user'
  const bubbleRef = useRef(null)

  useEffect(() => {
    if (isStreaming && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [content, isStreaming])

  return (
    <div
      ref={bubbleRef}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}
      style={{ animationDelay: '0ms' }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center flex-shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`relative inline-block px-4 py-3 rounded-2xl ${isUser
            ? 'bg-[var(--accent)] text-[var(--bg-deep)] rounded-tr-sm'
            : 'bg-[var(--glass-bg)] border border-white/10 rounded-tl-sm'
          }`}
        >
          {toolCalls && toolCalls.length > 0 && (
            <div className="mb-2 space-y-1">
              {toolCalls.map((tc) => (
                <div key={tc.id} className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-white/5 px-2 py-1 rounded">
                  <span className="text-[var(--accent)]">▸</span>
                  <span className="font-mono">{tc.name}</span>
                  <span className="text-[var(--text-muted)]">({JSON.stringify(tc.arguments).slice(0, 50)}...)</span>
                </div>
              ))}
            </div>
          )}

          {toolResults && toolResults.length > 0 && (
            <details className="mb-2 group">
              <summary className="flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer">
                <span>Tool Results</span>
                <span className="text-[var(--accent)]">▼</span>
              </summary>
              <div className="mt-2 p-2 bg-white/5 rounded text-xs font-mono max-h-48 overflow-auto">
                {toolResults.map((tr, i) => (
                  <div key={i} className="mb-1 text-white/70">{JSON.stringify(tr, null, 2).slice(0, 500)}</div>
                ))}
              </div>
            </details>
          )}

          <ReactMarkdown
            components={renderer}
            className={`prose prose-sm ${isUser ? 'text-[var(--bg-deep)]' : ''} max-w-none`}
          >
            {content}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse ml-1" />
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-white/10 rounded transition-colors" aria-label="Good response">
              <ThumbsUp size={14} className="text-[var(--text-muted)] hover:text-[var(--accent)]" />
            </button>
            <button className="p-1 hover:bg-white/10 rounded transition-colors" aria-label="Bad response">
              <ThumbsDown size={14} className="text-[var(--text-muted)] hover:text-[var(--accent)]" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  )
}