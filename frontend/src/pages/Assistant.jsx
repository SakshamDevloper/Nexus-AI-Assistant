import { useState, useRef, useEffect, useCallback } from 'react'
import { Microphone, MicrophoneSlash, PaperPlane, Bars, Brain, RightFromBracket, User, Robot, Copy, Check, Sun, Moon, Plus, ChevronRight, CircleStop, PenToSquare, TrashCan, ImageIcon, FileIcon, FolderIcon, Sparkles } from '../icons'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import VoiceStrands from '../components/VoiceOrb/VoiceStrands'
import ModelSelector from '../components/ModelSelector/ModelSelector'
import MemoryPanel from '../components/MemoryPanel/MemoryPanel'
import AuthModal from '../components/Auth/AuthModal'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useAgentStream } from '../hooks/useAgentStream'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

import StaggeredMenu from '../components/ReactBits/StaggeredMenu'
import MagicRings from '../components/ReactBits/MagicRings'



/* ---------- Code Block ---------- */
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-b border-border-color rounded-t-lg">
        <span className="text-[11px] text-white/30 font-mono">{language || 'code'}</span>
        <button onClick={handleCopy} className="text-white/30 hover:text-white/60 transition-colors">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter style={oneDark} language={language || 'text'} customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '13px', background: '#0a0f0e' }} showLineNumbers>
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

/* ---------- Tool Call Row ---------- */
function ToolCallRow({ toolCall }) {
  const [expanded, setExpanded] = useState(false)
  const isRunning = toolCall.status === 'running' || toolCall.status === 'pending'

  return (
    <div className="group/tc mb-1 last:mb-0">
      <div className="flex items-center gap-2 text-xs text-text-muted bg-white/[0.03] px-2.5 py-1.5 rounded-lg font-mono transition-colors">
        {isRunning ? (
          <div className="w-3.5 h-3.5 relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full border border-accent border-t-transparent animate-spin" />
          </div>
        ) : (
          <span className="text-accent text-[10px]">&#10003;</span>
        )}
        <span className="text-accent/80 font-medium">{toolCall.name}</span>
        <span className="text-white/15 truncate max-w-[140px]">{toolCall.arguments}</span>
        <button onClick={() => setExpanded(!expanded)} className="ml-auto text-white/10 hover:text-white/40 transition-colors text-[10px]">
          {expanded ? 'less' : 'more'}
        </button>
      </div>
      {expanded && toolCall.result && (
        <div className="mt-1 ml-4 p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
          <pre className="text-[10px] text-text-muted font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">{toolCall.result}</pre>
        </div>
      )}
    </div>
  )
}

/* ---------- Message Bubble ---------- */
function MessageBubble({ message, onEdit, onDelete, onSpeak }) {
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const isUser = message.role === 'user'
  const hasToolCalls = message.toolCalls?.length > 0

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditStart = () => {
    setEditText(message.content)
    setEditing(true)
  }

  const handleEditSubmit = () => {
    onEdit?.(message.id, editText)
    setEditing(false)
  }

  return (
    <div className={`group/message flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-accent/20 ring-1 ring-accent/20' : 'bg-white/[0.06] ring-1 ring-white/[0.08]'
      }`}>
        {isUser ? <User size={12} className="text-accent" /> : <span className="text-xs font-bold text-accent/80">N</span>}
      </div>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-colors ${
          isUser
            ? 'bg-accent/15 text-white/90 rounded-tr-md'
            : 'bg-white/[0.04] border border-white/[0.06] text-white/80 rounded-tl-md'
        }`}>
          {hasToolCalls && (
            <div className="mb-2 space-y-1">
              {message.toolCalls.map((tc) => (
                <ToolCallRow key={tc.id} toolCall={tc} />
              ))}
            </div>
          )}

          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-accent/50"
                rows={3} autoFocus />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="text-xs text-white/40 hover:text-white/70 px-2 py-1 rounded transition-colors">Cancel</button>
                <button onClick={handleEditSubmit} className="text-xs text-accent hover:text-accent/80 px-2 py-1 rounded bg-accent/10 transition-colors">Save</button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert">
              {message.streaming && !message.content ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 typing-dot" />
                  </div>
                  <span className="text-[11px] text-accent/40 font-mono animate-fade-in">Thinking...</span>
                </div>
              ) : (
                <ReactMarkdown components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                      <CodeBlock language={match ? match[1] : ''}>{String(children).replace(/\n$/, '')}</CodeBlock>
                    ) : (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
                    )
                  },
                }}>
                  {message.content}
                </ReactMarkdown>
              )}
              {message.streaming && message.content && (
                <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full ml-0.5 typing-dot" style={{ animationDelay: '0s' }} />
              )}
            </div>
          )}
        </div>

        {/* Actions row — always visible buttons */}
        {!editing && !message.streaming && (
          <div className={`flex gap-1 mt-1 ${isUser ? 'flex-row-reverse' : ''}`}>
            <button onClick={handleCopy}
              className="p-1 rounded text-white/15 hover:text-white/60 hover:bg-white/[0.04] transition-all">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            {isUser && (
              <button onClick={handleEditStart}
                className="p-1 rounded text-white/15 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                <PenToSquare size={12} />
              </button>
            )}
            {!isUser && (
              <button onClick={() => onSpeak?.(message.content)}
                className="p-1 rounded text-white/15 hover:text-accent hover:bg-white/[0.04] transition-all"
                title="Read aloud">
                <Microphone size={12} />
              </button>
            )}
            <button onClick={() => onDelete?.(message.id)}
              className="p-1 rounded text-white/15 hover:text-red-400 hover:bg-white/[0.04] transition-all">
              <TrashCan size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  { title: 'Explore topics', desc: 'Ask me about science, tech, or history' },
  { title: 'Write something', desc: 'Draft an email, essay, or creative piece' },
  { title: 'Analyze data', desc: 'Upload a file or describe a dataset' },
  { title: 'Debug code', desc: 'Paste code and I\'ll find the issue' },
]

/* ---------- Chat Interface ---------- */
function ChatInterface({ onSendMessage, onSpeakMessage }) {
  const { messages, isStreaming, pendingToolCalls, updateMessage, removeMessage } = useChatStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingToolCalls])

  const handleSuggestion = (text) => {
    onSendMessage?.(text)
  }

  const handleEdit = (id, newText) => {
    updateMessage(id, { content: newText })
  }

  const handleDelete = (id) => {
    removeMessage(id)
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <div className="mb-6">
            <img src="/brand/logo.svg" alt="NexusAI" className="w-14 h-14 mx-auto opacity-60 neon-logo" />
          </div>
          <h1 className="text-xl font-bold text-white/80 mb-1">What can I help with?</h1>
          <p className="text-sm text-text-muted mb-8 max-w-md">
            Ask anything — research, write, analyze, or code. I'm here to help.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-lg w-full px-4">
            {SUGGESTIONS.map((s) => (
                <button key={s.title} onClick={() => handleSuggestion(s.title)}
                className="group flex flex-col items-start gap-1 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-accent/20 transition-all text-left card-hover">
                <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">{s.title}</span>
                <span className="text-[11px] text-text-muted leading-tight">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={msg.id} message={msg}
          onEdit={msg.role === 'user' ? handleEdit : undefined}
          onDelete={handleDelete}
          onSpeak={msg.role === 'assistant' ? onSpeakMessage : undefined} />
      ))}

      {pendingToolCalls.length > 0 && !pendingToolCalls.some(tc => tc.status === 'completed') && (
        <div className="flex items-center gap-2 px-4 py-1">
          <div className="flex items-center gap-2 bg-white/[0.03] rounded-full px-3 py-1.5 border border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-white/30 font-mono">
              {'>'} {pendingToolCalls[pendingToolCalls.length - 1]?.name || 'processing...'}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

/* ---------- Main Export ---------- */
export default function Assistant() {
  const [input, setInput] = useState('')
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [orbState, setOrbState] = useState('idle')
  const [showUpload, setShowUpload] = useState(false)
  const [filePreviews, setFilePreviews] = useState([])
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const folderRef = useRef(null)

  const { messages, isStreaming, sessions, loadSession, newSession, saveSession } = useChatStore()
  const { voiceEnabled, autoSpeak, voiceSpeed, voicePitch, theme, toggleTheme } = useSettingsStore()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { isConnected, sendMessage, stopGeneration } = useAgentStream()
  const voiceModeRef = useRef(false)

  const speechRec = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'en-US',
    onResult: (text, isFinal) => {
      if (isFinal) {
        setInput(prev => prev + text)
        voiceModeRef.current = true
        saveSession()
        sendMessage(text)
      }
    },
    onStart: () => setOrbState('listening'),
    onEnd: () => setOrbState(isStreaming ? 'thinking' : 'idle'),
  })

  const synth = useSpeechSynthesis()

  useEffect(() => {
    if (isStreaming) setOrbState('thinking')
    else if (!speechRec.isListening) setOrbState('idle')
  }, [isStreaming, speechRec.isListening])

  useEffect(() => {
    if (!voiceModeRef.current) return
    if (messages.length > 0 && !isStreaming) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant' && lastMsg.content && !lastMsg.spoken) {
        setOrbState('speaking')
        synth.speak(lastMsg.content, {
          rate: voiceSpeed,
          pitch: voicePitch,
          onEnd: () => {
            setOrbState('idle')
            useChatStore.getState().updateMessage(lastMsg.id, { spoken: true })
            voiceModeRef.current = false
          },
        })
      }
    }
  }, [messages, isStreaming, voiceSpeed, voicePitch])

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return
    saveSession()
    sendMessage(input.trim())
    setInput('')
    setFilePreviews([])
    inputRef.current?.focus()
  }, [input, isStreaming, saveSession, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicToggle = () => {
    if (speechRec.isListening) speechRec.stop()
    else speechRec.start()
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files?.length) {
      const previews = Array.from(files).slice(0, 5).map(f => ({ name: f.name, size: f.size, type: f.type }))
      setFilePreviews(prev => [...prev, ...previews])
      setShowUpload(false)
    }
    e.target.value = ''
  }

  const handleFolderSelect = (e) => {
    const files = e.target.files
    if (files?.length) {
      const folderName = files[0].webkitRelativePath.split('/')[0]
      setFilePreviews(prev => [...prev, { name: folderName + '/', size: files.length, type: 'folder' }])
      setShowUpload(false)
    }
    e.target.value = ''
  }

  const triggerUpload = (type) => {
    setShowUpload(false)
    if (type === 'folder') {
      const el = folderRef.current
      if (el) {
        el.setAttribute('directory', '')
        el.setAttribute('webkitdirectory', '')
        el.removeAttribute('accept')
        el.click()
      }
    } else {
      const el = fileRef.current
      if (el) {
        el.accept = type === 'photo' ? 'image/*' : '*/*'
        el.removeAttribute('directory')
        el.removeAttribute('webkitdirectory')
        el.click()
      }
    }
  }

  const showOrbOverlay = speechRec.isListening

  return (
    <div className="h-screen flex flex-col bg-bg-deep text-text-primary relative overflow-hidden">
      {/* Global Navigation */}
      <StaggeredMenu
        position="right"
        isFixed={true}
        items={[
          { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
          { label: 'History', ariaLabel: 'View conversation history', link: '/history' },
          ...(!user ? [{ label: 'Sign In', ariaLabel: 'Sign in to your account', onClick: () => setAuthOpen(true) }] : []),
        ]}
        accentColor="#5ed29c"
        colors={['#0a0f0e', '#0d1412', '#111a17']}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#5ed29c"
        changeMenuColorOnOpen={true}
        displaySocials={false}
        displayItemNumbering={true}
      />

      {/* Decorative background elements */}
      <div className="fixed -right-40 top-1/3 w-[500px] h-[500px] opacity-15 pointer-events-none z-0">
        <MagicRings ringCount={6} baseRadius={0.3} radiusStep={0.12} lineThickness={0.015} color="#5ed29c" colorTwo="#6366f1" opacity={0.3} rotation={0.2} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface-95 backdrop-blur-xl p-4 border-r border-border-color flex flex-col">
            <div className="flex items-center justify-center mb-6 pt-2">
              <img src="/brand/logo.svg" alt="NexusAI" className="w-11 h-11 rounded-xl" />
            </div>
            <div className="flex flex-col gap-1.5 mb-6">
              <button onClick={() => { newSession(); setSidebarOpen(false) }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all w-full text-left">
                <span className="text-lg leading-none text-accent">+</span> New Chat
              </button>
              <button onClick={() => { setMemoryOpen(true); setSidebarOpen(false) }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all w-full text-left">
                <Brain size={15} className="text-accent" /> Memory
              </button>
            </div>
            {user && (
              <button onClick={logout} className="mt-auto flex items-center gap-2 px-3 py-2 text-xs text-white/20 hover:text-red-400 transition-colors">
                <RightFromBracket size={12} /> Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 relative z-10">
        {/* Sidebar desktop */}
        <div className={`hidden md:flex flex-col bg-surface-80 backdrop-blur-xl border-r border-border-color relative z-20 p-4 transition-all duration-300 ${sidebarCollapsed ? 'w-0 p-0 overflow-hidden border-none' : 'w-72'}`}>
          {!sidebarCollapsed && (
            <>
              <div className="flex items-center justify-center mb-6 pt-1">
                <img src="/brand/logo.svg" alt="NexusAI" className="w-11 h-11 rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <button onClick={() => newSession()}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all w-full text-left">
                  <span className="text-lg leading-none text-accent">+</span> New Chat
                </button>
                <button onClick={() => setMemoryOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all w-full text-left">
                  <Brain size={15} className="text-accent" /> Memory
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-0.5 mb-4 custom-scrollbar">
                {sessions.length === 0 && (
                  <p className="text-xs text-white/15 text-center py-6">No history yet</p>
                )}
                {sessions.slice(0, 20).map((session) => (
                  <button key={session.id} onClick={() => loadSession(session.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-all truncate">
                    {session.title || 'New Chat'}
                  </button>
                ))}
              </div>
              {user && (
                <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-xs text-white/20 hover:text-red-400 transition-colors">
                  <RightFromBracket size={12} /> Logout
                </button>
              )}
            </>
          )}
        </div>
        {/* Sidebar toggle button */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 w-5 h-10 items-center justify-center bg-surface-80 backdrop-blur-xl border border-border-color rounded-r-lg text-white/20 hover:text-accent hover:bg-surface-95 transition-all cursor-pointer"
          style={{ marginLeft: sidebarCollapsed ? '0' : '17.5rem' }}>
          <ChevronRight size={10} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-20 pt-16">
          {/* Chat messages */}
          <div className="flex-1 min-h-0 relative">
            <ChatInterface onSendMessage={(text) => { saveSession(); sendMessage(text); setInput(''); setFilePreviews([]) }}
              onSpeakMessage={(text) => {
                synth.speak(text, { rate: voiceSpeed, pitch: voicePitch })
              }} />
          </div>

          {/* Voice animation between chat and input */}
          {showOrbOverlay && (
            <div className="flex justify-center py-2">
              <VoiceStrands state={orbState} />
            </div>
          )}

          {/* Hidden ModelSelector for plus button trigger */}
          <div className="hidden">
            <ModelSelector />
          </div>

          {/* Input area — ChatGPT style */}
          <div className="px-3 pb-3 pt-2 relative z-30">
            <div className="max-w-3xl mx-auto">
              {/* File preview chips */}
              {filePreviews.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 px-1">
                  {filePreviews.map((fp, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1"
                      title={fp.type === 'folder' ? `${fp.name} (${fp.size} files)` : `${fp.name} (${(fp.size / 1024).toFixed(1)} KB)`}>
                      <span className="text-[10px]">{fp.type === 'folder' ? '&#128193;' : fp.type.startsWith('image') ? '&#128247;' : '&#128196;'}</span>
                      <span className="text-[11px] text-white/60 truncate max-w-[100px]">{fp.name}</span>
                      <button onClick={() => setFilePreviews(prev => prev.filter((_, j) => j !== i))}
                        className="text-white/20 hover:text-white/60 transition-colors ml-0.5">
                        <span className="text-[10px]">&#10005;</span>
                      </button>
                    </div>
                  ))}
                  {filePreviews.length > 5 && (
                    <span className="text-[11px] text-text-muted self-center">+{filePreviews.length - 5} more</span>
                  )}
                </div>
              )}

              <div className="flex items-end gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 focus-within:border-white/[0.15] transition-all">
                {/* + Upload/Agent button */}
                <div className="relative">
                  <button onClick={() => setShowUpload(!showUpload)}
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all">
                    <Plus size={18} />
                  </button>
                  {showUpload && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUpload(false)} />
                      <div className="absolute bottom-full left-0 mb-2 z-20 bg-surface-95 backdrop-blur-xl border border-border-color rounded-xl p-1.5 shadow-lg min-w-[180px] origin-bottom-left animate-slide-up">
                        <button onClick={() => triggerUpload('file')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-lg transition-all text-left">
                          <FileIcon size={14} /> File
                        </button>
                        <button onClick={() => triggerUpload('photo')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-lg transition-all text-left">
                          <ImageIcon size={14} /> Photo
                        </button>
                        <button onClick={() => triggerUpload('folder')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-lg transition-all text-left">
                          <FolderIcon size={14} /> Folder
                        </button>
                        <div className="border-t border-border-color my-1" />
                        <button onClick={() => { setShowUpload(false); document.querySelector('[data-model-selector]')?.click() }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-accent hover:text-accent/80 hover:bg-white/[0.04] rounded-lg transition-all text-left font-medium">
                          <Sparkles size={14} /> Switch Model
                        </button>
                      </div>
                    </>
                  )}
                  <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
                  <input ref={folderRef} type="file" className="hidden" onChange={handleFolderSelect} />
                </div>

                {/* Textarea */}
                <div className="flex-1 relative">
                  <textarea ref={inputRef} value={input}
                    onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="Message NexusAI..." rows={1}
                    className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none"
                    style={{ maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>

                {/* Mic */}
                <button onClick={handleMicToggle}
                  className={`p-2 rounded-xl transition-all ${
                    speechRec.isListening ? 'bg-accent text-bg-deep' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
                  }`}>
                  {speechRec.isListening ? <MicrophoneSlash size={16} /> : <Microphone size={16} />}
                </button>

                {/* Send / Stop */}
                {isStreaming ? (
                  <button onClick={stopGeneration}
                    className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 border border-white/[0.12] transition-all"
                    title="Stop generation">
                    <CircleStop size={16} />
                  </button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim()}
                    className="p-2 rounded-xl bg-accent text-bg-deep hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    <PaperPlane size={16} />
                  </button>
                )}
              </div>

              {/* Connection indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent' : 'bg-red-400'}`} />
                <span className="text-[10px] text-white/15 font-mono">
                  {isConnected ? 'connected' : 'disconnected'}
                </span>
              </div>

              {speechRec.interimTranscript && (
                <p className="text-xs text-white/15 mt-1.5 italic text-center">{speechRec.interimTranscript}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {memoryOpen && <MemoryPanel onClose={() => setMemoryOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
