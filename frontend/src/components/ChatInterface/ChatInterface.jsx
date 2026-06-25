import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User, Bot } from 'lucide-react'
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
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0d1117] border-b border-white/10 rounded-t-lg">
        <span className="text-[11px] text-white/40 font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '13px' }}
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
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-accent/20' : 'bg-white/10'
      }`}>
        {isUser ? <User size={14} className="text-accent" /> : <Bot size={14} className="text-white/60" />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl ${
          isUser
            ? 'bg-accent/15 text-white rounded-tr-md'
            : 'glass text-white/90 rounded-tl-md'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert">
              {message.streaming && !message.content ? (
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-white/40 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-white/40 typing-dot" />
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
        <p className="text-[10px] text-white/20 mt-1 px-1">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
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
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Bot size={28} className="text-accent" />
          </div>
          <h2 className="text-xl font-display font-bold text-white/80 mb-2">Start a conversation</h2>
          <p className="text-sm text-white/40 max-w-xs">
            Type a message or click the mic to start speaking with NexusAI.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Tool call indicators */}
      {pendingToolCalls.length > 0 && (
        <div className="flex items-center gap-2 px-12 py-2">
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-white/50">
              Using tool: {pendingToolCalls[pendingToolCalls.length - 1]?.name || 'processing...'}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
