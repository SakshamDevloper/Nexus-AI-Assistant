import { useState, useMemo } from 'react'
import { ArrowRight, Sparkles, Bolt, User } from '../icons'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/Auth/AuthModal'
import { useAuth } from '../hooks/useAuth'
import SplitText from '../components/ReactBits/SplitText'
import BlurText from '../components/ReactBits/BlurText'
import ShinyText from '../components/ReactBits/ShinyText'
import GradientText from '../components/ReactBits/GradientText'
import CountUp from '../components/ReactBits/CountUp'
import ScrollFloat from '../components/ReactBits/ScrollFloat'
import RotatingText from '../components/ReactBits/RotatingText'
import StarBorder from '../components/ReactBits/StarBorder'
import TextType from '../components/ReactBits/TextType'
import Hyperspeed from '../components/ReactBits/Hyperspeed'
import PillNav from '../components/ReactBits/PillNav'
import LogoLoop from '../components/ReactBits/LogoLoop'
import BorderGlow from '../components/ReactBits/BorderGlow'
import SplashCursor from '../components/ReactBits/SplashCursor'
import { FaGoogle, FaRocket, FaBrain, FaBolt, FaShieldAlt } from 'react-icons/fa'
import { FaRobot } from 'react-icons/fa6'
import { SiAnthropic, SiMistralai } from 'react-icons/si'

const features = [
  { icon: FaBolt, title: 'Voice-First', desc: 'Speak naturally with real-time speech recognition and synthesis.', color: '#5ed29c' },
  { icon: FaBrain, title: 'Multi-Model AI', desc: 'Switch between GPT-4o, DeepSeek, Llama, Gemini and more mid-conversation.', color: '#6366f1' },
  { icon: FaRocket, title: 'Agentic Tools', desc: 'Search the web, check weather, look up facts -- AI does the work.', color: '#f472b6' },
  { icon: FaShieldAlt, title: 'Persistent Memory', desc: 'Remembers your preferences, context, and conversation history.', color: '#fbbf24' },
]

const modelNames = ['GPT-4o', 'DeepSeek', 'Llama', 'Gemini']

const partnerLogos = [
  { node: <FaRobot size={28} className="text-white/40 hover:text-white/60 transition-colors" /> },
  { node: <FaGoogle size={28} className="text-white/40 hover:text-white/60 transition-colors" /> },
  { node: <SiAnthropic size={28} className="text-white/40 hover:text-white/60 transition-colors" /> },
  { node: <SiMistralai size={28} className="text-white/40 hover:text-white/60 transition-colors" /> },
  { node: <span className="text-xl font-black text-white/40 font-display tracking-widest">DS</span> },
  { node: <span className="text-xl font-black text-white/40 font-display tracking-widest">LLM</span> },
]

const hyperspeedOptions = useMemo(() => ({
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 526344,
    islandColor: 657930,
    background: 0,
    shoulderLines: 1250072,
    brokenLines: 1250072,
    leftCars: [14177983, 6770850, 12732332],
    rightCars: [242627, 941733, 3294549],
    sticks: 242627,
  }
}), [])

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#050807] overflow-x-hidden relative">
      {/* Fullscreen Hyperspeed Background */}
      <div className="fixed inset-0 z-0">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Splash Cursor */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <SplashCursor
          TRANSPARENT={true}
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
          BACK_COLOR={{ r: 0, g: 0, b: 0 }}
          RAINBOW_MODE={false}
          COLOR="#5ed29c"
        />
      </div>

      {/* PillNav */}
      <div className="relative z-50 flex justify-center pt-4">
        <PillNav
          logo="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%235ed29c'/%3E%3Cstop offset='100%25' stop-color='%236366f1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='40' height='40' rx='10' fill='url(%23g)'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='%23000' font-size='20' font-weight='900' font-family='sans-serif'%3EN%3C/text%3E%3C/svg%3E"
          logoAlt="NexusAI"
          items={[
            { href: '/', label: 'Home' },
            { href: '#features', label: 'Features' },
            { href: '#partners', label: 'Partners' },
            ...(user ? [] : [{ href: '#signin', label: 'Sign In' }]),
            { href: '/assistant', label: 'Launch App' },
          ]}
          activeHref="/"
          baseColor="rgba(18,15,23,0.85)"
          pillColor="#ffffff"
          hoveredPillTextColor="#120F17"
          pillTextColor="#ffffff"
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-10">
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
              Voice & Chat Agent
            </GradientText>
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
              <span className="flex items-center gap-2 px-6 py-2 font-bold text-sm">
                <Bolt size={16} />
                Start Chatting
                <ArrowRight size={16} />
              </span>
            </StarBorder>
            <button className="bg-white/5 backdrop-blur-xl rounded-full px-8 py-3.5 text-sm text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/20">
              Watch Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 md:gap-16 mt-16">
            <div className="text-center">
              <p className="text-3xl font-bold text-white"><CountUp to={5} duration={2.5} /></p>
              <p className="text-xs text-white/30 mt-1">AI Models</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white"><CountUp to={3} duration={2.5} delay={0.2} /></p>
              <p className="text-xs text-white/30 mt-1">Agent Tools</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white"><CountUp to={100} duration={2.5} delay={0.4} suffix="%" /></p>
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

      {/* Partners Section */}
      <section id="partners" className="relative py-24 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollFloat animationDuration={1.2} ease="back.inOut(2)" stagger={0.03}>
            <p className="text-center text-xs text-white/20 mb-10 uppercase tracking-[0.2em] font-medium">
              Powered by Industry-Leading AI
            </p>
          </ScrollFloat>
          <LogoLoop
            logos={partnerLogos}
            speed={100}
            direction="left"
            logoHeight={40}
            gap={80}
            pauseOnHover={true}
            fadeOut={true}
            fadeOutColor="#050807"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-6 py-24 max-w-6xl mx-auto z-10">
        <div className="text-center mb-16">
          <ScrollFloat animationDuration={1.2} ease="back.inOut(2)" scrollStart="center bottom+=50%" scrollEnd="bottom bottom-=40%" stagger={0.03}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Why NexusAI?</h2>
          </ScrollFloat>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Built for modern workflows with{' '}
            <RotatingText
              texts={['voice AI', 'multi-model reasoning', 'real-time tools', 'persistent memory']}
              rotationInterval={2500}
              className="text-accent font-semibold inline"
            />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <BorderGlow
                key={feat.title}
                className="rounded-2xl p-8"
                backgroundColor="#0a0f0e"
                borderRadius={16}
                edgeSensitivity={20}
                glowIntensity={0.7}
                colors={[`${feat.color}33`, 'rgba(99,102,241,0.15)', 'rgba(244,114,182,0.15)']}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${feat.color}15`, boxShadow: `0 0 20px ${feat.color}10` }}>
                  <Icon size={22} color={feat.color} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">Ready to get started?</h2>
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
            <span className="flex items-center gap-2 px-6 py-2 font-bold text-sm">
              Launch NexusAI
              <ArrowRight size={16} />
            </span>
          </StarBorder>
        </BorderGlow>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-8 border-t border-white/5 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">NexusAI — Final Year Project</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-white/20 hover:text-white/40 transition-colors">Features</a>
            <a href="#partners" className="text-xs text-white/20 hover:text-white/40 transition-colors">Partners</a>
            <button onClick={() => setAuthOpen(true)} className="text-xs text-white/20 hover:text-white/40 transition-colors">
              {user ? user.email : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
