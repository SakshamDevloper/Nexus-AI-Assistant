import { useState } from 'react'
import { ArrowRight, Sparkles, Microphone, Comment, Brain, Globe, Bolt, User } from '../icons'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/Auth/AuthModal'
import { useAuth } from '../hooks/useAuth'

import SplitText from '../components/ReactBits/SplitText'
import BlurText from '../components/ReactBits/BlurText'
import ShinyText from '../components/ReactBits/ShinyText'
import GradientText from '../components/ReactBits/GradientText'
import DecryptedText from '../components/ReactBits/DecryptedText'
import CountUp from '../components/ReactBits/CountUp'
import ScrollFloat from '../components/ReactBits/ScrollFloat'
import RotatingText from '../components/ReactBits/RotatingText'
import StarBorder from '../components/ReactBits/StarBorder'
import TextType from '../components/ReactBits/TextType'

const features = [
  {
    icon: Microphone,
    title: 'Voice-First',
    desc: 'Speak naturally with real-time speech recognition and synthesis.',
  },
  {
    icon: Comment,
    title: 'Multi-Model AI',
    desc: 'Switch between GPT-4o, DeepSeek, Llama, Gemini and more mid-conversation.',
  },
  {
    icon: Globe,
    title: 'Agentic Tools',
    desc: 'Search the web, check weather, look up facts -- AI does the work.',
  },
  {
    icon: Brain,
    title: 'Persistent Memory',
    desc: 'Remembers your preferences, context, and conversation history.',
  },
]

const modelNames = ['GPT-4o', 'DeepSeek', 'Llama', 'Gemini']

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg-deep overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] animate-pulse-glow" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/3 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-sm font-bold text-bg-deep">N</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">NexusAI</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-white/50 hover:text-white text-sm transition-colors">Features</a>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{user.displayName || user.email}</span>
              <button onClick={logout} className="text-xs text-white/30 hover:text-red-400 transition-colors">Logout</button>
            </div>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5">
              <User size={14} /> Sign in
            </button>
          )}
          <StarBorder
            as="button"
            onClick={() => navigate('/assistant')}
            color="#5ed29c"
            speed="8s"
            thickness={1.5}
            className="!rounded-full"
          >
            <span className="px-1 font-semibold text-sm">Get Started</span>
          </StarBorder>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={12} className="text-accent" />
            <ShinyText text="Multi-Modal AI Assistant" speed={3} shineColor="#5ed29c" className="text-xs text-white/60" />
          </div>

          <SplitText
            text="Your Intelligent Voice & Chat Agent"
            className="text-[clamp(44px,9vw,80px)] font-display font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            delay={30}
            duration={1}
            splitType="chars"
            from={{ opacity: 0, y: 60, rotateX: -20 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0.05}
            rootMargin="-50px"
          />

          <div className="text-[clamp(44px,9vw,80px)] font-display font-extrabold leading-[1.05] tracking-tight mb-6 -mt-6">
            <GradientText
              colors={['#5ed29c', '#3d8b6e', '#5ed29c']}
              animationSpeed={4}
              direction="horizontal"
            >
              Voice & Chat
            </GradientText>
            {' '}
            <DecryptedText
              text="Agent"
              speed={80}
              maxIterations={15}
              animateOn="hover"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*"
              className="text-white"
            />
          </div>

          <BlurText
            text="Talk or type to NexusAI -- powered by multiple LLMs, agentic tools, and persistent memory. Your smart thinking partner for work, research, and creativity."
            className="text-white/40 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed"
            delay={100}
            animateBy="words"
            direction="top"
            threshold={0.2}
          />

          <div className="flex items-center justify-center gap-4">
            <StarBorder
              as="button"
              onClick={() => navigate('/assistant')}
              color="#5ed29c"
              speed="6s"
              thickness={1}
              className="!rounded-full"
            >
              <span className="flex items-center gap-2 px-2 font-bold text-sm">
                <Bolt size={16} />
                Start Chatting
                <ArrowRight size={16} />
              </span>
            </StarBorder>
            <button className="glass rounded-full px-8 py-3.5 text-sm text-white/50 hover:text-white transition-colors">
              See Demo
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mt-16">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <CountUp to={5} duration={2} />
              </p>
              <p className="text-xs text-white/30 mt-1">AI Models</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <CountUp to={3} duration={2} delay={0.2} />
              </p>
              <p className="text-xs text-white/30 mt-1">Agent Tools</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <CountUp to={100} duration={2} delay={0.4} suffix="%" />
              </p>
              <p className="text-xs text-white/30 mt-1">Private</p>
            </div>
          </div>

          <div className="mt-8">
            <TextType
              text={modelNames}
              typingSpeed={60}
              deletingSpeed={40}
              pauseDuration={2000}
              loop={true}
              className="text-sm text-white/30 inline-block"
              cursorClassName="text-accent"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <ScrollFloat
            animationDuration={1.2}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              Why NexusAI?
            </h2>
          </ScrollFloat>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Built for modern workflows with{' '}
            <RotatingText
              texts={['voice', 'multi-model AI', 'real-time tools', 'persistent memory']}
              rotationInterval={2500}
              className="text-accent font-semibold inline"
            />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="glass rounded-2xl p-7 card-hover transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center mb-4 ring-1 ring-accent/10">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24 text-center">
        <div className="glass-glow rounded-3xl max-w-2xl mx-auto p-12 md:p-16 pulse-glow">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto">
            No signup required. Start chatting with NexusAI instantly.
          </p>
          <StarBorder
            as="button"
            onClick={() => navigate('/assistant')}
            color="#5ed29c"
            speed="6s"
            thickness={1}
            className="!rounded-full"
          >
            <span className="flex items-center gap-2 px-2 font-bold text-sm">
              Launch NexusAI
              <ArrowRight size={16} />
            </span>
          </StarBorder>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <p className="text-center text-xs text-white/20">
          NexusAI -- Final Year Project. Built with React, Node.js, and multiple AI providers.
        </p>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
