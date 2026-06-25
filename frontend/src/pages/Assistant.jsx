import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Menu, Settings, Brain, LogOut, User as UserIcon } from 'lucide-react'
import VoiceOrb from '../components/VoiceOrb/VoiceOrb'
import ChatInterface from '../components/ChatInterface/ChatInterface'
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
      } else {
        setInput(prev => {
          const words = prev.split(' ')
          if (words.length > 0 && !prev.endsWith(' ')) {
            return prev
          }
          return prev
        })
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
    if (speechRec.isListening) {
      speechRec.stop()
    } else {
      speechRec.start()
    }
  }

  return (
    <div className="h-screen flex bg-bg-deep text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 glass-strong p-4">
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

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-72 flex-col glass border-r border-white/10">
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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/50 hover:text-white/80" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-white/80">NexusAI</h1>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent' : 'bg-red-400'}`} />
            <span className="text-[10px] text-white/30">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector />
            <ToolBar />
          </div>
        </div>

        {/* Chat messages */}
        <ChatInterface />

        {/* Input area */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or click the mic..."
                rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-accent/50 transition-colors"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>

            <button
              onClick={handleMicToggle}
              className={`p-3 rounded-xl transition-colors ${
                speechRec.isListening
                  ? 'bg-accent text-bg-deep'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {speechRec.isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-3 rounded-xl bg-accent text-bg-deep hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>

          {speechRec.interimTranscript && (
            <p className="text-xs text-white/30 mt-2 italic">{speechRec.interimTranscript}</p>
          )}
        </div>
      </div>

      {/* Voice Orb overlay when listening/speaking */}
      {(speechRec.isListening || orbState === 'speaking') && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
          <VoiceOrb state={orbState} />
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-xs font-bold text-bg-deep">N</span>
          </div>
          <span className="text-sm font-semibold">NexusAI</span>
        </div>
      </div>

      <button
        onClick={onNew}
        className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left mb-4"
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {sessions.length === 0 && (
          <p className="text-xs text-white/20 text-center py-4">No history yet</p>
        )}
        {sessions.slice(0, 20).map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session.id)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors truncate"
          >
            {session.title || 'New Chat'}
          </button>
        ))}
      </div>

      <div className="space-y-1 border-t border-white/10 pt-3">
        <button
          onClick={onMemory}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <Brain size={14} />
          Memory
        </button>
        <div className="border-t border-white/5 pt-2 mt-2">
          {user ? (
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <UserIcon size={12} className="text-accent" />
                  </div>
                )}
                <span className="text-xs text-white/50 truncate">{user.displayName || user.email || 'User'}</span>
              </div>
              <button onClick={onLogout} className="text-white/20 hover:text-red-400 transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuth}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent hover:bg-white/5 transition-colors"
            >
              <UserIcon size={14} />
              Sign in
            </button>
          )}
        </div>
      </div>
    </>
  )
}
