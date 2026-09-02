import { FaRobot, FaGoogle, FaRocket, FaCheckCircle, FaCog, FaServer, FaLightbulb, FaArrowRight, FaChartBar, FaDatabase, FaCloud, FaShieldAlt, FaBolt, FaDollarSign, FaMicrochip, FaGlobe, FaQuestionCircle, FaBook, FaCode, FaStar, FaTachometerAlt } from 'react-icons/fa'
import { SiAnthropic, SiMistralai, SiOpenai, SiMeta, SiMongodb, SiRedis, SiFirebase, SiCloudinary, SiNetlify, SiGithub } from 'react-icons/si'
import StaggeredMenu from '../components/ReactBits/StaggeredMenu'
import SplitText from '../components/ReactBits/SplitText'
import ScrollFloat from '../components/ReactBits/ScrollFloat'
import GradientText from '../components/ReactBits/GradientText'
import ShinyText from '../components/ReactBits/ShinyText'
import BorderGlow from '../components/ReactBits/BorderGlow'
import RotatingText from '../components/ReactBits/RotatingText'
import DecryptedText from '../components/ReactBits/DecryptedText'
import CountUp from '../components/ReactBits/CountUp'
import BlurText from '../components/ReactBits/BlurText'
import StarBorder from '../components/ReactBits/StarBorder'
import { useNavigate } from 'react-router-dom'
import LogoLoop from '../components/ReactBits/LogoLoop'

const partnerLogos = [
  { node: <FaRobot size={28} className="neon-logo text-white/40" style={{ animationDelay: '0s' }} /> },
  { node: <FaGoogle size={28} className="neon-logo text-white/40" style={{ animationDelay: '0.5s' }} /> },
  { node: <SiAnthropic size={28} className="neon-logo text-white/40" style={{ animationDelay: '1s' }} /> },
  { node: <SiMistralai size={28} className="neon-logo text-white/40" style={{ animationDelay: '1.5s' }} /> },
  { node: <span className="neon-logo text-xl font-black text-white/40 font-display tracking-widest" style={{ animationDelay: '2s' }}>DS</span> },
  { node: <span className="neon-logo text-xl font-black text-white/40 font-display tracking-widest" style={{ animationDelay: '2.5s' }}>MM</span> },
  { node: <span className="neon-logo text-xl font-black text-white/40 font-display tracking-widest" style={{ animationDelay: '3s' }}>LLM</span> },
]

const providers = [
  {
    name: 'OpenAI',
    icon: <SiOpenai size={24} />,
    models: 'GPT-4o, GPT-4o-mini',
    color: '#5ed29c',
    tag: 'Production',
    desc: 'Industry-leading language models with broad reasoning, creativity, and tool-use capabilities. OpenAI powers the most complex reasoning tasks with state-of-the-art performance across benchmarks.',
    strengths: ['Reasoning & logic', 'Creative writing', 'Tool/function calling', 'Broad knowledge base'],
    useCase: 'Complex reasoning tasks, content generation, and general-purpose chat with highest accuracy.',
    status: 'Active',
  },
  {
    name: 'Groq',
    icon: <FaRocket size={24} />,
    models: 'Llama 3.3 70B',
    color: '#6366f1',
    tag: 'Fastest',
    desc: 'Blazing-fast inference through custom LPU hardware. Groq delivers sub-100ms response times on Llama models, making it ideal for real-time conversational AI with minimal latency.',
    strengths: ['Lowest latency', 'Open-weight models', 'Cost-effective', 'Scalable infrastructure'],
    useCase: 'Real-time voice conversations, streaming chat, and latency-sensitive applications.',
    status: 'Active',
  },
  {
    name: 'Google',
    icon: <FaGoogle size={24} />,
    models: 'Gemini 1.5 Flash',
    color: '#f472b6',
    tag: 'Multimodal',
    desc: 'Google\'s multimodal model with native vision understanding, long-context windows (up to 1M tokens), and seamless integration with Google Cloud services.',
    strengths: ['Vision understanding', 'Long context (1M tokens)', 'Multimodal inputs', 'Cloud integration'],
    useCase: 'Multimodal analysis — images, long documents, and tasks requiring large context windows.',
    status: 'Active',
  },
  {
    name: 'DeepSeek',
    icon: <span className="text-xl font-black">DS</span>,
    models: 'DeepSeek Chat',
    color: '#fbbf24',
    tag: 'Open-Weight',
    desc: 'A powerful open-weight model that rivals proprietary systems in coding and reasoning benchmarks. DeepSeek offers strong performance with full model transparency.',
    strengths: ['Coding benchmarks', 'Structured reasoning', 'Open weights', 'Research-grade'],
    useCase: 'Code generation, debugging, mathematical reasoning, and technical problem-solving.',
    status: 'Active',
  },
  {
    name: 'Anthropic',
    icon: <SiAnthropic size={24} />,
    models: 'Claude (coming soon)',
    color: '#5ed29c',
    tag: 'Safety-First',
    desc: 'Safety-focused AI labs creating Claude — models designed for nuanced reasoning, careful instruction following, and constitutionally aligned responses.',
    strengths: ['Safety alignment', 'Nuanced reasoning', 'Instruction following', 'Long-form writing'],
    useCase: 'Complex analysis, content moderation, legal/document review, and safety-critical applications.',
    status: 'Coming Soon',
  },
  {
    name: 'MiniMax',
    icon: <span className="text-xl font-black">MM</span>,
    models: 'MiniMax-Text-01',
    color: '#ec4899',
    tag: 'Ultra-Context',
    desc: 'Cutting-edge language models with massive context windows up to 4 million tokens. MiniMax handles incredibly long documents, extensive codebases, and massive conversation histories without losing context.',
    strengths: ['4M token context window', 'Long document parsing', 'Extensive codebase analysis', 'Consistent context recall'],
    useCase: 'Processing entire books, code repositories, or ultra-long audio transcripts.',
    status: 'Active',
  },
]

const techPartners = [
  { icon: SiMongodb, name: 'MongoDB Atlas', desc: 'Durable long-term storage for conversations, memories, and user profiles', color: '#47A248' },
  { icon: SiRedis, name: 'Redis', desc: 'In-memory session cache for low-latency context retrieval across conversations', color: '#DC382D' },
  { icon: SiFirebase, name: 'Firebase Auth', desc: 'Secure authentication with Google OAuth and email/password login flows', color: '#FFCA28' },
  { icon: SiCloudinary, name: 'Cloudinary', desc: 'Media storage and optimization for file uploads and rich content delivery', color: '#3448C5' },
  { icon: SiNetlify, name: 'Netlify', desc: 'Frontend deployment with global CDN, serverless functions, and edge caching', color: '#00AD9F' },
  { icon: SiGithub, name: 'GitHub', desc: 'Open-source repository hosting with CI/CD, issue tracking, and community contributions', color: '#ffffff' },
]

const metrics = [
  { value: 7, suffix: '', label: 'Active Providers', color: '#5ed29c', desc: 'Integrated and tested' },
  { value: 9, suffix: '+', label: 'Active Models', color: '#6366f1', desc: 'Available right now' },
  { value: 99, suffix: '%', label: 'Routing Reliability', color: '#f472b6', desc: 'Smart fallback ensures uptime' },
  { value: 500, suffix: '+', label: 'Daily Requests', color: '#fbbf24', desc: 'And growing every day' },
  { value: 4, suffix: 'M', label: 'Max Context', color: '#a855f7', desc: 'Largest context window available' },
  { value: 200, suffix: 'ms', label: 'Fastest Latency', color: '#14b8a6', desc: 'Groq-powered response times' },
  { value: 12, suffix: '', label: 'Infra Partners', color: '#ec4899', desc: 'Powering the stack' },
  { value: 90, suffix: '%', label: 'Cost Reduction', color: '#5ed29c', desc: 'vs single-provider solutions' },
]

const benchmarks = [
  { model: 'GPT-4o', provider: 'OpenAI', latency: '1.2s', mmlu: '88.7', humaneval: '92.1', gsm8k: '95.4', costPer1k: '$0.01', bestFor: 'Complex reasoning, creative writing, tool calling', color: '#5ed29c' },
  { model: 'GPT-4o Mini', provider: 'OpenAI', latency: '0.4s', mmlu: '82.0', humaneval: '87.2', gsm8k: '87.1', costPer1k: '$0.002', bestFor: 'Fast general chat, cost-sensitive tasks', color: '#5ed29c' },
  { model: 'Llama 3.3 70B', provider: 'Groq', latency: '0.2s', mmlu: '86.0', humaneval: '81.7', gsm8k: '89.0', costPer1k: '$0.0005', bestFor: 'Real-time voice, low-latency chat, streaming', color: '#6366f1' },
  { model: 'Gemini 1.5 Flash', provider: 'Google', latency: '0.6s', mmlu: '78.5', humaneval: '79.4', gsm8k: '83.3', costPer1k: '$0.0003', bestFor: 'Multimodal analysis, long docs (1M context)', color: '#f472b6' },
  { model: 'DeepSeek Chat', provider: 'DeepSeek', latency: '0.8s', mmlu: '79.2', humaneval: '83.6', gsm8k: '84.1', costPer1k: '$0.001', bestFor: 'Code generation, debugging, math reasoning', color: '#fbbf24' },
  { model: 'MiniMax-Text-01', provider: 'MiniMax', latency: '1.0s', mmlu: '81.5', humaneval: '78.9', gsm8k: '86.2', costPer1k: '$0.008', bestFor: 'Entire codebases, books, 4M token windows', color: '#ec4899' },
]

export default function Partners() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState('')

  const handleProviderExpand = (name) => {
    if (expanded === name) return ''
    return name
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden relative">
      <StaggeredMenu
        position="right"
        isFixed={true}
        items={[
          { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
          { label: 'Assistant', ariaLabel: 'Chat interface', link: '/assistant' },
          { label: 'Voice', ariaLabel: 'Voice assistant', link: '/voice' },
          { label: 'Features', ariaLabel: 'View features', link: '/features' },
          { label: 'History', ariaLabel: 'View history', link: '/history' },
        ]}
        accentColor="#5ed29c"
        colors={['#0a0f0e', '#0d1412', '#111a17']}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#5ed29c"
        changeMenuColorOnOpen={true}
        displaySocials={false}
        displayItemNumbering={false}
      />

      {/* Logo Loop */}
      <div className="mb-8">
        <ScrollFloat animationDuration={1} ease="back.inOut(2)" stagger={0.03}>
          <p className="text-center text-xs text-white/20 mb-4 uppercase tracking-[0.2em] font-medium">
            Trusted Providers in Production
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">Industry-Leading AI Providers</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            NexusAI integrates the world's best AI models into a single, unified interface. Switch between providers mid-conversation with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p, i) => (
            <div
              key={p.name}
              className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
              onMouseEnter={() => setExpanded(p.name)}
              onMouseLeave={() => setExpanded('')}
              onFocus={() => setExpanded(p.name)}
              onBlur={() => setExpanded('')}
              tabindex="0"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: p.color + '12', color: p.color }}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-semibold text-white text-sm">{p.name}</h3>
                  <p className="text-[10px] text-white/40 font-mono">{p.models}</p>
                </div>
              </div>
              <p className="text-white/35 text-xs leading-relaxed">{p.desc}</p>
              <div className="mt-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5 shrink-0" style={{ borderColor: p.color + '25', color: p.color, background: p.color + '08' }}>
                  {p.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          {techPartners.map((tp) => (
            <div key={tp.name} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]" onFocus={() => setExpanded(tp.name)} onBlur={() => setExpanded('')} tabindex="0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: tp.color + '12', color: tp.color }}>
                  {tp.icon}
                </div>
                <h3 className="text-white font-semibold text-sm">{tp.name}</h3>
              </div>
              <p className="text-white/35 text-xs leading-relaxed">{tp.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          {metrics.map((m) => (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center transition-all duration-300 hover:border-white/20 hover:scale-[1.02]">
              <p className="text-2xl md:text-3xl font-bold" style={{ color: m.color }}>
                <CountUp to={m.value} duration={2.5} suffix={m.suffix} />
              </p>
              <p className="text-white/60 text-xs font-medium mt-1">{m.label}</p>
              <p className="text-white/25 text-[10px] mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          {benchmarks.map((b) => (
            <div key={b.model} className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-white font-semibold text-sm">{b.model}</h4>
                  <p className="text-white/40 text-xs">{b.provider}</p>
                </div>
                <div className="text-white/40 text-xs">{b.latency}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-white/40 text-xs">
                <div><strong>MMLU:</strong> {b.mmlu}</div>
                <div><strong>HumanEval:</strong> {b.humaneval}</div>
                <div><strong>GSM8K:</strong> {b.gsm8k}</div>
              </div>
              <p className="text-white/35 text-[10px] mt-2">{b.bestFor}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <StarBorder
            as="button"
            onClick={() => navigate('/assistant')}
            color="#5ed29c"
            speed="6s"
            thickness={1}
            className="!rounded-full">
            <span className="flex items-center gap-2 px-6 py-2 font-bold text-sm">
              Open Assistant
              <FaArrowRight size={12} />
            </span>
          </StarBorder>
          <button
            onClick={() => navigate('/voice')}
            className="bg-white/5 backdrop-blur-xl rounded-full px-6 py-2 text-sm text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/20 hover:scale-105">
            Try Voice Mode
          </button>
        </div>
      </div>
    </div>
  )
}