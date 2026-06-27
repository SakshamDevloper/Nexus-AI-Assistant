import { useState, useRef } from 'react'
import { ArrowRight, Sparkles, Microphone, Comment, Brain, Globe, Bolt, User, Robot } from '../icons'
import { useNavigate, Link } from 'react-router-dom'
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
import Hyperspeed from '../components/ReactBits/Hyperspeed'
import PillNav from '../components/ReactBits/PillNav'
import LogoLoop from '../components/ReactBits/LogoLoop'
import BorderGlow from '../components/ReactBits/BorderGlow'
import Orb from '../components/ReactBits/Orb'
import MagicRings from '../components/ReactBits/MagicRings'

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

const partnerLogos = [
  { node: <span className="text-2xl font-bold text-white/30 font-display">OpenAI</span> },
  { node: <span className="text-2xl font-bold text-white/30 font-display">Groq</span> },
  { node: <span className="text-2xl font-bold text-white/30 font-display">DeepSeek</span> },
  { node: <span className="text-2xl font-bold text-white/30 font-display">Google</span> },
  { node: <span className="text-2xl font-bold text-white/30 font-display">Anthropic</span> },
  { node: <span className="text-2xl font-bold text-white/30 font-display">Mistral</span> },
]

const navItems = [
  { href: '/', label: 'Home' },
  { href: '#features', label: 'Features' },
]

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const heroRef = useRef(null)
  const featuresRef = useRef(null)

  return (
    <div className="min-h-screen bg-bg-deep overflow-x-hidden relative">
      {/* Fullscreen Hyperspeed Background */}
      <div className="fixed inset-0 z-0">
        <Hyperspeed
          speed={0.2}
          density={0.8}
          warp={0.6}
          color1="#5ed29c"
          color2="#6366f1"
          color3="#f472b6"
        />
      </div>

      {/* Decorative Orb */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] opacity-30 pointer-events-none z-[1]">
        <Orb
          hue={140}
          hoverIntensity={0.2}
          rotateOnHover={false}
          backgroundColor="#070b0a"
        />
      </div>

      {/* Magic Rings Decorative */}
      <div className="fixed bottom-[10%] left-[-10%] w-[600px] h-[600px] opacity-20 pointer-events-none z-[1]">
        <MagicRings
          ringCount={8}
          baseRadius={0.4}
          radiusStep={0.15}
          lineThickness={0.015}
          color="#5ed29c"
          colorTwo="#f472b6"
          opacity={0.4}
          rotation={0.3}
        />
      </div>

      {/* PillNav */}
      <div className="relative z-50 flex justify-center pt-4">
        <PillNav
          logo="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' stroke='%235ed29c' stroke-width='2'/%3E%3C/svg%3E"
          logoAlt="NexusAI"
          items={[
            ...navItems,
            ...(user
              ? []
              : [{ href: '#signin', label: 'Sign In', onClick: () => setAuthOpen(true) }]
            ),
            { href: '/assistant', label: 'Launch App' },
          ]}
          activeHref="/"
          baseColor="#120F17"
          pillColor="#ffffff"
          hoveredPillTextColor="#120F17"
          pillTextColor="#ffffff"
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-10">
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-full px-5 py-2 mb-8 border border-white/10">
            <Sparkles size={12} className="text-accent" />
            <ShinyText text="Multi-Modal AI Assistant" speed={3} shineColor="#5ed29c" className="text-xs text-white/60" />
          </div>

          <div className="mb-4">
            <SplitText
              text="Your Intelligent"
              className="text-[clamp(44px,9vw,80px)] font-display font-extrabold text-white leading-[1.05] tracking-tight"
              delay={40}
              duration={1}
              splitType="chars"
              from={{ opacity: 0, y: 60, rotateX: -20 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
              threshold={0.05}
              rootMargin="-50px"
            />
          </div>

          <div className="text-[clamp(44px,9vw,80px)] font-display font-extrabold leading-[1.05] tracking-tight mb-6">
            <GradientText
              colors={['#5ed29c', '#6366f1', '#f472b6', '#5ed29c']}
              animationSpeed={6}
              direction="horizontal"
            >
              Voice & Chat
            </GradientText>
            {' '}
            <DecryptedText
              text="Agent"
              speed={60}
              maxIterations={20}
              animateOn="hover"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*"
              className="text-white"
            />
          </div>

          <BlurText
            text="Talk or type to NexusAI -- powered by multiple LLMs, agentic tools, and persistent memory. Your smart thinking partner for work, research, and creativity."
            className="text-white/40 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed"
            delay={80}
            animateBy="words"
            direction="top"
            threshold={0.2}
          />

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <StarBorder
              as="button"
              onClick={() => navigate('/assistant')}
              color="#5ed29c"
              speed="6s"
              thickness={1}
              className="!rounded-full"
            >
              <span className="flex items-center gap-2 px-4 py-1 font-bold text-sm">
                <Bolt size={16} />
                Start Chatting
                <ArrowRight size={16} />
              </span>
            </StarBorder>
            <button className="bg-white/5 backdrop-blur-xl rounded-full px-8 py-3.5 text-sm text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/20">
              See Demo
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mt-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                <CountUp to={5} duration={2.5} />
              </p>
              <p className="text-xs text-white/30 mt-1">AI Models</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                <CountUp to={3} duration={2.5} delay={0.2} />
              </p>
              <p className="text-xs text-white/30 mt-1">Agent Tools</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                <CountUp to={100} duration={2.5} delay={0.4} suffix="%" />
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

      {/* Logo/Partner Section */}
      <section className="relative py-20 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-white/20 mb-8 uppercase tracking-widest">Powered by industry-leading AI</p>
          <LogoLoop
            logos={partnerLogos}
            speed={80}
            direction="left"
            logoHeight={40}
            gap={60}
            pauseOnHover={true}
            fadeOut={true}
            fadeOutColor="#070b0a"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative px-6 py-24 max-w-5xl mx-auto z-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <BorderGlow
                key={feature.title}
                className="rounded-2xl p-7"
                backgroundColor="#0a0f0e"
                glowColor="152 55 44"
                glowIntensity={0.6}
                borderRadius={16}
                edgeSensitivity={25}
                animated={false}
                colors={['rgba(94,210,156,0.3)', 'rgba(99,102,241,0.2)', 'rgba(244,114,182,0.2)']}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center mb-4 ring-1 ring-accent/10">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </BorderGlow>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24 text-center z-10">
        <BorderGlow
          className="rounded-3xl max-w-2xl mx-auto p-12 md:p-16"
          backgroundColor="#0a0f0e"
          borderRadius={24}
          glowColor="152 55 44"
          glowIntensity={0.8}
          edgeSensitivity={15}
          animated={true}
          colors={['rgba(94,210,156,0.4)', 'rgba(99,102,241,0.3)', 'rgba(244,114,182,0.3)']}
        >
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
            <span className="flex items-center gap-2 px-4 py-1 font-bold text-sm">
              Launch NexusAI
              <ArrowRight size={16} />
            </span>
          </StarBorder>
        </BorderGlow>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-8 border-t border-white/5 z-10">
        <p className="text-center text-xs text-white/20">
          NexusAI -- Final Year Project. Built with React, Node.js, and multiple AI providers.
        </p>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
