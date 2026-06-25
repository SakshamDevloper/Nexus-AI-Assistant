import { useState } from 'react'
import { ArrowRight, Sparkles, Mic, MessageCircle, Brain, Globe, Zap, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/Auth/AuthModal'
import { useAuth } from '../hooks/useAuth'

const features = [
  {
    icon: Mic,
    title: 'Voice-First',
    desc: 'Speak naturally with real-time speech recognition and synthesis.',
  },
  {
    icon: MessageCircle,
    title: 'Multi-Model AI',
    desc: 'Switch between GPT-4o, DeepSeek, Llama, Gemini and more mid-conversation.',
  },
  {
    icon: Globe,
    title: 'Agentic Tools',
    desc: 'Search the web, check weather, look up facts — AI does the work.',
  },
  {
    icon: Brain,
    title: 'Persistent Memory',
    desc: 'Remembers your preferences, context, and conversation history.',
  },
]

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg-deep overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-xs font-bold text-bg-deep">N</span>
          </div>
          <span className="text-white font-bold text-lg">NexusAI</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">Features</a>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{user.displayName || user.email}</span>
              <button onClick={logout} className="text-xs text-white/30 hover:text-red-400 transition-colors">Logout</button>
            </div>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5">
              <UserIcon size={14} /> Sign in
            </button>
          )}
          <button
            onClick={() => navigate('/assistant')}
            className="bg-accent text-bg-deep font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={12} className="text-accent" />
            <span className="text-xs text-white/60">Multi-Modal AI Assistant</span>
          </div>

          <h1 className="text-[clamp(40px,8vw,72px)] font-display font-extrabold text-white leading-[1.05] tracking-tight mb-4">
            Your Intelligent{' '}
            <span className="text-accent">
              Voice & Chat
            </span>
            <br />
            Agent
          </h1>

          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Talk or type to NexusAI — powered by multiple LLMs, agentic tools, and persistent memory.
            Your smart thinking partner for work, research, and creativity.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/assistant')}
              className="flex items-center gap-2 bg-accent text-bg-deep font-bold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-all"
            >
              <Zap size={16} />
              Start Chatting
              <ArrowRight size={16} />
            </button>
            <button className="glass rounded-full px-8 py-3.5 text-sm text-white/60 hover:text-white transition-colors">
              See Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-3">
            Why NexusAI?
          </h2>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Built for modern workflows with voice, multi-model AI, and real-time tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="glass rounded-2xl p-6 card-hover transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="glass-strong rounded-3xl max-w-2xl mx-auto p-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto">
            No signup required. Start chatting with NexusAI instantly.
          </p>
          <button
            onClick={() => navigate('/assistant')}
            className="inline-flex items-center gap-2 bg-accent text-bg-deep font-bold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-all"
          >
            Launch NexusAI
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <p className="text-center text-xs text-white/20">
          NexusAI — Final Year Project. Built with React, Node.js, and multiple AI providers.
        </p>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
