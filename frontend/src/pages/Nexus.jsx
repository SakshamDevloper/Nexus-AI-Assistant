import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Microphone, PaperPlane, ArrowRight, Brain } from '../icons'
import StaggeredMenu from '../components/ReactBits/StaggeredMenu'
import MagicRings from '../components/ReactBits/MagicRings'
import { useAuth } from '../hooks/useAuth'
import AuthModal from '../components/Auth/AuthModal'

export default function Nexus() {
  const [activeTab, setActiveTab] = useState('voice')
  const [authOpen, setAuthOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-bg-deep text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MagicRings ringCount={6} baseRadius={0.3} radiusStep={0.12} lineThickness={0.015} color="#5ed29c" colorTwo="#6366f1" opacity={0.16} rotation={0.25} />
      </div>

      <StaggeredMenu
        position="right"
        isFixed={true}
        items={[
          { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
          { label: 'Assistant', ariaLabel: 'Go to assistant chat', link: '/assistant' },
          { label: 'History', ariaLabel: 'View history', link: '/history' },
          ...(!user ? [{ label: 'Sign In', ariaLabel: 'Sign in to your account', onClick: () => setAuthOpen(true) }] : []),
        ]}
        accentColor="#5ed29c"
        colors={['#0a0f0e', '#0d1412', '#111a17']}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#5ed29c"
        changeMenuColorOnOpen={true}
        displaySocials={false}
        displayItemNumbering={false}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-3xl rounded-[36px] border border-white/[0.08] bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
          <div className="text-center mb-8">
            <p className="text-sm text-accent uppercase tracking-[0.35em] mb-3">Nexus Voice & Chat</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">Choose your entry mode</h1>
            <p className="mt-4 text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
              Select a mode and start with the experience that fits your workflow. No emoji distractions, no clutter — only clear, expressive interaction.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`rounded-3xl border p-6 text-left transition-all duration-300 ${activeTab === 'chat' ? 'border-accent bg-white/10 shadow-[0_0_0_1px_rgba(94,210,156,0.24)]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-accent">Chat Assistant</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Text Chat</h2>
                </div>
                <PaperPlane size={28} className="text-accent" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Start a typed conversation with model selection and agent tools. Perfect for written workflows, long-form prompts, and structured tasks.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`rounded-3xl border p-6 text-left transition-all duration-300 ${activeTab === 'voice' ? 'border-accent bg-white/10 shadow-[0_0_0_1px_rgba(94,210,156,0.24)]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-accent">Voice First</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Voice Flow</h2>
                </div>
                <Microphone size={28} className="text-accent" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Engage through speech with live listening, voice animation, and the focused voice experience inspired by the assistant page.
              </p>
            </button>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-black/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Selected mode</p>
                <h3 className="text-xl font-semibold text-white mt-2">{activeTab === 'chat' ? 'Chat mode' : 'Voice mode'}</h3>
              </div>
              <button
                onClick={() => navigate(activeTab === 'chat' ? '/assistant' : '/voice')}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-bg-deep transition-all hover:brightness-110">
                {activeTab === 'chat' ? 'Go to chat' : 'Go to voice'}
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/[0.08] bg-white/5 p-5">
                <p className="text-sm text-white/60">Model selector stays available in chat mode, so you can choose the intelligence style before sending messages.</p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-white/5 p-5">
                <p className="text-sm text-white/60">Voice mode loads a focused interface with the same strand-driven animation language and a simpler microphone-first experience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
