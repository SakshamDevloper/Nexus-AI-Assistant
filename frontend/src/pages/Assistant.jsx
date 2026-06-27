import { useState, useRef, useEffect } from 'react'
import { Microphone, MicrophoneSlash, PaperPlane, Bars, Brain, RightFromBracket, User, Robot, Copy, Check } from '../icons'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import VoiceOrb from '../components/VoiceOrb/VoiceOrb'
import ModelSelector from '../components/ModelSelector/ModelSelector'
import ToolBar from '../components/ToolBar/ToolBar'
import MemoryPanel from '../components/MemoryPanel/MemoryPanel'
import AuthModal from '../components/Auth/AuthModal'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useAgentStream } from '../hooks/useAgentStream'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

import SplashCursor from '../components/ReactBits/SplashCursor'
import Orb from '../components/ReactBits/Orb'
import GradualBlur from '../components/ReactBits/GradualBlur'
import MagicRings from '../components/ReactBits/MagicRings'
import Strands from '../components/ReactBits/Strands'
import LaserFlow from '../components/ReactBits/LaserFlow'
import ShinyText from '../components/ReactBits/ShinyText'

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
        <button onClick={handleCopy} className="text-white/30 hover:text-white/60 transition-colors">
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
  const hasToolCalls = message.toolCalls?.length > 0

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser
          ? 'bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/20'
          : 'bg-accent/10 ring-1 ring-accent/20'
      }`}>
        {isUser
          ? <User size={14} className="text-accent" />
          : <Robot size={14} className="text-accent" />
        }
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-accent/20 to-accent/5 text-white rounded-tr-md ring-1 ring-accent/10'
            : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 rounded-tl-md'
        }`}>
          {hasToolCalls && (
            <div className="mb-2 space-y-1">
              {message.toolCalls.map((tc) => (
                <div key={tc.id} className="flex items-center gap-2 text-xs text-white/40 bg-white/5 px-2.5 py-1.5 rounded-lg font-mono">
                  <span className="text-accent">&#9667;</span>
                  <span>{tc.name}</span>
                  <span className="text-white/20 truncate max-w-[120px]">{tc.arguments}</span>
                </div>
              ))}
            </div>
          )}

          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert">
              {message.streaming && !message.content ? (
                <div className="flex gap-1.5 py-2">
                  <span className="w-2 h-2 rounded-full bg-accent/60 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-accent/60 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-accent/60 typing-dot" />
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
              {message.streaming && message.content && (
                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse ml-1" />
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

function ChatInterface() {
  const { messages, isStreaming, pendingToolCalls } = useChatStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingToolCalls])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scroll-smooth">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 ring-1 ring-accent/10 pulse-glow">
            <Robot size={40} className="text-accent" />
          </div>
          <h2 className="text-xl font-display font-bold text-white/80 mb-2">
            <ShinyText text="Start a conversation" speed={2} shineColor="#5ed29c" />
          </h2>
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
          <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-white/45 font-mono">
              {'>'} {pendingToolCalls[pendingToolCalls.length - 1]?.name || 'processing...'}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default function Assistant() {
  const [input, setInput] = useState('')
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [orbState, setOrbState] = useState('idle')
  const inputRef = useRef(null)

  const { messages, isStreaming, sessions, loadSession, newSession, saveSession } = useChatStore()
  const { voiceEnabled, autoSpeak, voiceSpeed, voicePitch } = useSettingsStore()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { isConnected, sendMessage } = useAgentStream()
  const speechRec = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'en-US',
    onResult: (text, isFinal) => {
      if (isFinal) {
        setInput(prev => prev + text)
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

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    saveSession()
    sendMessage(input.trim())
    setInput('')
    inputRef.current?.focus()
  }

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

  return (
    <div className="h-screen flex bg-bg-deep text-white relative overflow-hidden">
      {/* Background: Strands */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Strands
          speed={0.4}
          amplitude={0.5}
          waviness={0.7}
          thickness={0.25}
          glow={0.4}
          intensity={0.2}
          className="w-full h-full"
        />
      </div>

      {/* Secondary background: LaserFlow subtle */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-20">
        <LaserFlow
          wispDensity={0.3}
          flowSpeed={0.15}
          fogIntensity={0.1}
          color="#5ed29c"
          className="w-full h-full"
        />
      </div>

      {/* Splash cursor overlay */}
      <div className="fixed inset-0 z-[2] pointer-events-none">
        <SplashCursor
          TRANSPARENT={true}
          DENSITY_DISSIPATION={4}
          VELOCITY_DISSIPATION={3}
          SPLAT_FORCE={5000}
          COLOR_UPDATE_SPEED={6}
          BACK_COLOR={{ r: 0, g: 0, b: 0 }}
          RAINBOW_MODE={false}
          COLOR="#5ed29c"
        />
      </div>

      {/* Large decorative Orb */}
      <div className="fixed -right-40 top-1/3 w-[500px] h-[500px] opacity-25 pointer-events-none z-[3]">
        <Orb
          hue={140}
          hoverIntensity={0.15}
          rotateOnHover={false}
          backgroundColor="#070b0a"
        />
      </div>

      {/* Magic Rings decorative */}
      <div className="fixed left-[-15%] bottom-[-10%] w-[500px] h-[500px] opacity-15 pointer-events-none z-[3]">
        <MagicRings
          ringCount={8}
          baseRadius={0.35}
          radiusStep={0.14}
          lineThickness={0.02}
          color="#5ed29c"
          colorTwo="#6366f1"
          opacity={0.4}
          rotation={0.25}
        />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0f0e]/95 backdrop-blur-xl p-4 border-r border-white/10">
            <SidebarContent
              sessions={sessions}
              onSelect={(id) => { loadSession(id); setSidebarOpen(false) }}
              onNew={() => { newSession(); setSidebarOpen(false) }}
              onMemory={() => { setMemoryOpen(true); setSidebarOpen(false) }}
              onAuth={() => { setAuthOpen(true); setSidebarOpen(false) }}
              user={user}
              onLogout={logout}
            />
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-72 flex-col bg-[#0a0f0e]/80 backdrop-blur-xl border-r border-white/10 relative z-20">
        <SidebarContent
          sessions={sessions}
          onSelect={loadSession}
          onNew={newSession}
          onMemory={() => setMemoryOpen(true)}
          onAuth={() => setAuthOpen(true)}
          user={user}
          onLogout={logout}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0a0f0e]/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/40 hover:text-white/70 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Bars size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-xs font-bold text-bg-deep">N</span>
              </div>
              <h1 className="text-sm font-semibold text-white/70">NexusAI</h1>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent shadow-sm shadow-accent/50 animate-pulse' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector />
            <ToolBar />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 relative z-10">
          <ChatInterface />
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10">
            <GradualBlur position="bottom" height="4rem" strength={1} opacity={0.8} divCount={5} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4 pt-3 border-t border-white/10 relative z-30 bg-[#0a0f0e]/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-white/5 rounded-2xl border border-white/10 p-2 focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/10 transition-all">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message or click the mic..."
                  rows={1}
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none"
                  style={{ maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                />
              </div>

              <button
                onClick={handleMicToggle}
                className={`p-2.5 rounded-xl transition-all ${
                  speechRec.isListening
                    ? 'bg-accent text-bg-deep shadow-lg shadow-accent/25'
                    : 'text-white/40 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {speechRec.isListening ? <MicrophoneSlash size={18} /> : <Microphone size={18} />}
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-2.5 rounded-xl bg-accent text-bg-deep hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20"
              >
                <PaperPlane size={18} />
              </button>
            </div>

            {speechRec.interimTranscript && (
              <p className="text-xs text-white/20 mt-2 italic text-center">{speechRec.interimTranscript}</p>
            )}
          </div>
        </div>
      </div>

      {/* Voice Orb Overlay */}
      {(speechRec.isListening || orbState === 'speaking') && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
          <div className="relative">
            <div className="absolute inset-[-50px] opacity-30 pointer-events-none">
              <Orb hue={orbState === 'listening' ? 180 : 140} hoverIntensity={0.1} rotateOnHover={false} backgroundColor="#070b0a" />
            </div>
            <VoiceOrb state={orbState} />
          </div>
        </div>
      )}

      {memoryOpen && <MemoryPanel onClose={() => setMemoryOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}

function SidebarContent({ sessions, onSelect, onNew, onMemory, onAuth, user, onLogout }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-xs font-bold text-bg-deep">N</span>
          </div>
          <span className="text-sm font-semibold text-white/80">NexusAI</span>
        </div>
      </div>

      <button
        onClick={onNew}
        className="w-full bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white transition-all text-left mb-4 flex items-center gap-2 border border-white/10"
      >
        <span className="text-accent text-base leading-none">+</span>
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-0.5 mb-4 custom-scrollbar">
        {sessions.length === 0 && (
          <p className="text-xs text-white/15 text-center py-6">No history yet</p>
        )}
        {sessions.slice(0, 20).map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all truncate"
          >
            {session.title || 'New Chat'}
          </button>
        ))}
      </div>

      <div className="space-y-0.5 border-t border-white/10 pt-3">
        <button
          onClick={onMemory}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <Brain size={14} className="text-accent/60" />
          Memory
        </button>
        <div className="pt-2 mt-1">
          {user ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-6 h-6 rounded-full ring-1 ring-accent/30" alt="" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center ring-1 ring-accent/20">
                    <User size={12} className="text-accent" />
                  </div>
                )}
                <span className="text-xs text-white/40 truncate">{user.displayName || user.email || 'User'}</span>
              </div>
              <button onClick={onLogout} className="text-white/15 hover:text-red-400 transition-colors">
                <RightFromBracket size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuth}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-accent hover:bg-white/5 transition-all"
            >
              <User size={14} />
              Sign in
            </button>
          )}
        </div>
      </div>
    </>
  )
}
