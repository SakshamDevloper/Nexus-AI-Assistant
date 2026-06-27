import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User, Robot } from '../../icons'
import { useChatStore } from '../../stores/chatStore'

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0a0f0e] border-b border-white/5 rounded-t-lg">
        <span className="text-[11px] text-white/30 font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '13px', background: '#0a0f0e' }}
        showLineNumbers
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser
          ? 'bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/20'
          : 'bg-white/5 ring-1 ring-white/10'
      }`}>
        {isUser
          ? <User size={14} className="text-accent" />
          : <Robot size={14} className="text-white/50" />
        }
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-accent/20 to-accent/5 text-white rounded-tr-md ring-1 ring-accent/10'
            : 'glass text-white/90 rounded-tl-md'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert">
              {message.streaming && !message.content ? (
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 rounded-full bg-white/30 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-white/30 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-white/30 typing-dot" />
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline ? (
                        <CodeBlock language={match ? match[1] : ''}>
                          {String(children).replace(/\n$/, '')}
                        </CodeBlock>
                      ) : (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>
        <p className="text-[10px] text-white/15 mt-1.5 px-1">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </p>
      </div>
    </div>
  )
}

export default function ChatInterface() {
  const { messages, isStreaming, pendingToolCalls } = useChatStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingToolCalls])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scroll-smooth">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-5 ring-1 ring-accent/10 pulse-glow">
            <Robot size={36} className="text-accent" />
          </div>
          <h2 className="text-xl font-display font-bold text-white/80 mb-2">Start a conversation</h2>
          <p className="text-sm text-white/35 max-w-xs">
            Type a message or click the mic to start speaking with NexusAI.
          </p>
          <div className="flex gap-2 mt-8">
            {['Ask anything', 'Search the web', 'Check weather'].map((hint) => (
              <span key={hint} className="text-[11px] text-white/20 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {pendingToolCalls.length > 0 && (
        <div className="flex items-center gap-2 px-12 py-2 animate-fade-in">
          <div className="flex items-center gap-2.5 glass rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-white/45">
              Using tool: {pendingToolCalls[pendingToolCalls.length - 1]?.name || 'processing...'}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
