import { useState, useRef, useEffect } from 'react'
import { Microphone, MicrophoneSlash, PaperPlane, Bars, Brain, RightFromBracket, User } from '../icons'
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

import SplashCursor from '../components/ReactBits/SplashCursor'
import Orb from '../components/ReactBits/Orb'
import GradualBlur from '../components/ReactBits/GradualBlur'
import MagicRings from '../components/ReactBits/MagicRings'
import Strands from '../components/ReactBits/Strands'

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
    <div className="h-screen flex bg-bg-deep text-white relative">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Strands
          speed={0.3}
          amplitude={0.4}
          waviness={0.6}
          thickness={0.3}
          glow={0.5}
          intensity={0.15}
          className="w-full h-full"
        />
      </div>

      {/* Splash cursor overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <SplashCursor
          TRANSPARENT={true}
          DENSITY_DISSIPATION={4}
          VELOCITY_DISSIPATION={3}
          SPLAT_FORCE={4000}
          COLOR_UPDATE_SPEED={8}
          BACK_COLOR={{ r: 0, g: 0, b: 0 }}
          RAINBOW_MODE={false}
          COLOR="#5ed29c"
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
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

      <div className="hidden md:flex w-72 flex-col glass border-r border-white/5 relative z-20">
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

      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-bg-deep/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/40 hover:text-white/70 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Bars size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                <span className="text-xs font-bold text-bg-deep">N</span>
              </div>
              <h1 className="text-sm font-semibold text-white/70">NexusAI</h1>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent shadow-sm shadow-accent/50' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector />
            <ToolBar />
          </div>
        </div>

        {/* Magic rings decorative behind chat */}
        <div className="absolute right-0 top-1/4 w-96 h-96 opacity-20 pointer-events-none z-0">
          <MagicRings
            ringCount={6}
            baseRadius={0.3}
            radiusStep={0.12}
            lineThickness={0.02}
            color="#5ed29c"
            colorTwo="#3d8b6e"
            opacity={0.3}
            fadeIn={0.3}
            fadeOut={2.5}
            rotation={0.2}
          />
        </div>

        <div className="flex-1 relative z-10">
          <ChatInterface />
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <GradualBlur position="bottom" height="4rem" strength={1} opacity={0.6} divCount={4} />
          </div>
        </div>

        {/* Orb decorative element */}
        <div className="absolute -left-20 top-1/3 w-40 h-40 opacity-10 pointer-events-none">
          <Orb
            hue={140}
            hoverIntensity={0.1}
            rotateOnHover={false}
            backgroundColor="#070b0a"
          />
        </div>

        <div className="px-4 pb-3 pt-2 border-t border-white/5 relative z-10">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or click the mic..."
                rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>

            <button
              onClick={handleMicToggle}
              className={`p-3 rounded-xl transition-all ${
                speechRec.isListening
                  ? 'bg-accent text-bg-deep shadow-lg shadow-accent/25'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 border border-white/10'
              }`}
            >
              {speechRec.isListening ? <MicrophoneSlash size={18} /> : <Microphone size={18} />}
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-3 rounded-xl bg-accent text-bg-deep hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20"
            >
              <PaperPlane size={18} />
            </button>
          </div>

          {speechRec.interimTranscript && (
            <p className="text-xs text-white/20 mt-2 italic text-center max-w-3xl mx-auto">{speechRec.interimTranscript}</p>
          )}
        </div>
      </div>

      {(speechRec.isListening || orbState === 'speaking') && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30">
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
        className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all text-left mb-4 flex items-center gap-2 border border-white/5"
      >
        <span className="text-accent text-base leading-none">+</span>
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-0.5 mb-4">
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

      <div className="space-y-0.5 border-t border-white/5 pt-3">
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
