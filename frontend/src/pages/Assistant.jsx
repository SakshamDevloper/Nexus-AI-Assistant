import { useState, useRef, useEffect, useCallback } from 'react'
import { Microphone, MicrophoneSlash, PaperPlane, Bars, Brain, RightFromBracket, User, Robot, Copy, Check, Sun, Moon, Plus } from '../icons'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import VoiceOrb from '../components/VoiceOrb/VoiceOrb'
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
import GooeyNav from '../components/ReactBits/GooeyNav'
import MagicRings from '../components/ReactBits/MagicRings'



/* ---------- Voice Wave Grid Overlay ---------- */
function VoiceWaveGrid({ state, accent = '#5ed29c' }) {
  const active = state === 'listening' || state === 'speaking'

  return (
    <>
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: [
            `linear-gradient(to right, ${accent}18 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${accent}18 1px, transparent 1px)`,
          ].join(', '),
          backgroundSize: '48px 48px',
          opacity: 0.06,
        }} />
      </div>
      {active && (
        <div className="fixed inset-0 z-[6] pointer-events-none overflow-hidden">
          <style>{`
            @keyframes wavePulse {
              0%, 100% { opacity: 0.08; transform: scaleY(1); }
              50% { opacity: 0.45; transform: scaleY(2.2); }
            }
          `}</style>
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="absolute left-0 right-0 h-[1px]" style={{
                top: `${8 + i * 8}%`,
                background: `linear-gradient(90deg, transparent 5%, ${accent}33 20%, ${accent}77 50%, ${accent}33 80%, transparent 95%)`,
                animation: `wavePulse ${1.2 + i * 0.15}s ease-in-out infinite`,
                animationDelay: `${i * 0.12}s`,
                boxShadow: state === 'listening' ? `0 0 6px ${accent}55, 0 0 20px ${accent}22` : `0 0 4px ${accent}44`,
                filter: 'blur(0.5px)',
              }} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

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

/* ---------- Message Bubble ---------- */
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const hasToolCalls = message.toolCalls?.length > 0

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-accent/20 ring-1 ring-accent/20' : 'bg-accent/10 ring-1 ring-accent/10'
      }`}>
        {isUser ? <User size={12} className="text-accent" /> : <Robot size={12} className="text-accent" />}
      </div>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent/15 text-white/90 rounded-tr-md'
            : 'bg-white/[0.04] border border-white/[0.06] text-white/80 rounded-tl-md'
        }`}>
          {hasToolCalls && (
            <div className="mb-2 space-y-1">
              {message.toolCalls.map((tc) => (
                <div key={tc.id} className="flex items-center gap-2 text-xs text-text-muted bg-white/[0.03] px-2.5 py-1.5 rounded-lg font-mono">
                  <span className="text-accent">&#9667;</span>
                  <span>{tc.name}</span>
                  <span className="text-white/15 truncate max-w-[120px]">{tc.arguments}</span>
                </div>
              ))}
            </div>
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert">
              {message.streaming && !message.content ? (
                <div className="flex gap-1 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
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
                <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full ml-0.5" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Chat Interface ---------- */
function ChatInterface() {
  const { messages, isStreaming, pendingToolCalls } = useChatStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingToolCalls])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <p className="text-sm text-text-muted max-w-xs leading-relaxed">
            Type a message or click the mic to start speaking with NexusAI.
          </p>
          <div className="flex gap-2 mt-6">
            {['Ask anything', 'Search the web', 'Check weather'].map((hint) => (
              <span key={hint} className="text-xs text-white/20 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06]">
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
  const [authOpen, setAuthOpen] = useState(false)
  const [orbState, setOrbState] = useState('idle')
  const [showUpload, setShowUpload] = useState(false)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  const { messages, isStreaming, sessions, loadSession, newSession, saveSession } = useChatStore()
  const { voiceEnabled, autoSpeak, voiceSpeed, voicePitch, theme, toggleTheme } = useSettingsStore()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { isConnected, sendMessage } = useAgentStream()
  const speechRec = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'en-US',
    onResult: (text, isFinal) => {
      if (isFinal) setInput(prev => prev + text)
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
    if (autoSpeak && messages.length > 0 && !isStreaming) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant' && lastMsg.content && !lastMsg.spoken) {
        setOrbState('speaking')
        synth.speak(lastMsg.content, {
          rate: voiceSpeed,
          pitch: voicePitch,
          onEnd: () => {
            setOrbState('idle')
            useChatStore.getState().updateMessage(lastMsg.id, { spoken: true })
          },
        })
      }
    }
  }, [messages, isStreaming, autoSpeak, voiceSpeed, voicePitch])

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return
    saveSession()
    sendMessage(input.trim())
    setInput('')
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
      // File selection handled here — show name as preview
      setInput(prev => prev + ` [${files[0].name}]`)
      setShowUpload(false)
    }
    e.target.value = ''
  }

  const showOrbOverlay = speechRec.isListening || orbState === 'speaking'

  return (
    <div className="h-screen flex flex-col bg-bg-deep text-text-primary relative overflow-hidden">
      {/* Global Navigation */}
      <StaggeredMenu
        position="right"
        isFixed={true}
        items={[
          { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
          { label: 'History', ariaLabel: 'View conversation history', link: '/history' },
        ]}
        accentColor="#5ed29c"
        colors={['#0a0f0e', '#0d1412', '#111a17']}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#5ed29c"
        changeMenuColorOnOpen={true}
        displaySocials={false}
        displayItemNumbering={true}
      />

      {/* Fixed top-left branding */}
      <div className="fixed top-3 left-3 z-50 flex items-center gap-2 pointer-events-none">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
          <span className="text-[10px] font-black text-black">N</span>
        </div>
        <span className="text-xs font-display font-semibold text-white/40">NexusAI</span>
      </div>

      {/* Decorative background elements */}
      <div className="fixed -right-40 top-1/3 w-[500px] h-[500px] opacity-15 pointer-events-none z-0">
        <MagicRings ringCount={6} baseRadius={0.3} radiusStep={0.12} lineThickness={0.015} color="#5ed29c" colorTwo="#6366f1" opacity={0.3} rotation={0.2} />
      </div>

      {/* Voice Wave Grid */}
      <VoiceWaveGrid state={orbState} />

      {/* Floating controls */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 md:hidden">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all">
          <Bars size={15} />
        </button>
      </div>
      <div className="fixed top-3 right-3 z-50 hidden md:flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface-95 backdrop-blur-xl p-4 border-r border-border-color flex flex-col">
            <div className="mb-6">
              <GooeyNav items={[
                { label: user?.displayName || user?.email || 'Sign In', href: '#', icon: <User size={15} /> },
                { label: 'New Chat', href: '#', icon: <span className="text-lg leading-none">+</span> },
                { label: 'Memory', href: '#', icon: <Brain size={15} /> },
              ]} animationTime={500} particleCount={10} particleDistances={[60, 8]} particleR={80} timeVariance={200} initialActiveIndex={0}
                onItemClick={(i) => {
                  if (i === 0 && !user) setAuthOpen(true)
                  if (i === 1) { newSession(); setSidebarOpen(false) }
                  if (i === 2) { setMemoryOpen(true); setSidebarOpen(false) }
                }} />
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
        <div className="hidden md:flex w-72 flex-col bg-surface-80 backdrop-blur-xl border-r border-border-color relative z-20 p-4">
          <div className="mb-6">
            <GooeyNav items={[
              { label: user?.displayName || user?.email || 'Sign In', href: '#', icon: <User size={15} /> },
              { label: 'New Chat', href: '#', icon: <span className="text-lg leading-none">+</span> },
              { label: 'Memory', href: '#', icon: <Brain size={15} /> },
            ]} animationTime={500} particleCount={10} particleDistances={[60, 8]} particleR={80} timeVariance={200} initialActiveIndex={0}
              onItemClick={(i) => {
                if (i === 0 && !user) setAuthOpen(true)
                if (i === 1) newSession()
                if (i === 2) setMemoryOpen(true)
              }} />
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
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-20">
          {/* Chat messages */}
          <div className="flex-1 relative">
            <ChatInterface />
          </div>

          {/* Input area — ChatGPT style */}
          <div className="px-3 pb-3 pt-2 relative z-30">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 focus-within:border-white/[0.15] transition-all">
                {/* + Upload button */}
                <div className="relative">
                  <button onClick={() => setShowUpload(!showUpload)}
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all">
                    <Plus size={18} />
                  </button>
                  {showUpload && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUpload(false)} />
                      <div className="absolute bottom-full left-0 mb-2 z-20 bg-surface-95 backdrop-blur-xl border border-border-color rounded-xl p-1.5 shadow-lg min-w-[160px]">
                        <button onClick={() => { fileRef.current?.click(); setShowUpload(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-lg transition-all text-left">
                          <span className="text-base">&#128206;</span> Image
                        </button>
                        <button onClick={() => { fileRef.current?.click(); setShowUpload(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-lg transition-all text-left">
                          <span className="text-base">&#128196;</span> Document
                        </button>
                      </div>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileSelect} />
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

                {/* Model selector inline */}
                <div className="shrink-0">
                  <ModelSelector />
                </div>

                {/* Mic */}
                <button onClick={handleMicToggle}
                  className={`p-2 rounded-xl transition-all ${
                    speechRec.isListening ? 'bg-accent text-bg-deep' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
                  }`}>
                  {speechRec.isListening ? <MicrophoneSlash size={16} /> : <Microphone size={16} />}
                </button>

                {/* Send */}
                <button onClick={handleSend} disabled={!input.trim() || isStreaming}
                  className="p-2 rounded-xl bg-accent text-bg-deep hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                  <PaperPlane size={16} />
                </button>
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

      {/* Voice Orb overlay */}
      {showOrbOverlay && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
          <VoiceOrb state={orbState} />
        </div>
      )}

      {memoryOpen && <MemoryPanel onClose={() => setMemoryOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
