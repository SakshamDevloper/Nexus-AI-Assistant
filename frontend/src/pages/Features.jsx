import { useRef, useState } from 'react'
import { FaRocket, FaBrain, FaBolt, FaShieldAlt, FaMicrochip, FaCogs, FaDatabase, FaCloud, FaLock, FaPalette, FaRobot, FaSearch, FaCode, FaCloudSun, FaHistory, FaExchangeAlt, FaHeadphones, FaGlobe, FaFileAlt, FaLayerGroup, FaNodeJs, FaPython, FaDocker, FaGitAlt, FaServer, FaMobileAlt, FaStar } from 'react-icons/fa'
import { SiOpenai, SiGithub, SiReact, SiTailwindcss, SiMongodb, SiRedis, SiFirebase, SiSocketdotio, SiVite } from 'react-icons/si'
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

const features = [
  {
    icon: FaBolt, title: 'Voice-First', color: '#5ed29c',
    desc: 'Natural voice interaction with real-time speech recognition, neural text-to-speech, and wake-word activation. The interface responds to your voice with low-latency streaming.',
    subs: [
      { icon: FaHeadphones, label: 'Real-Time STT', text: 'Web Speech API with continuous recognition, real-time transcription, and multi-language support' },
      { icon: FaRobot, label: 'Neural TTS', text: 'Natural-sounding female voice synthesis with Google TTS integration, configurable pitch and rate' },
      { icon: FaMicrochip, label: 'Wake Word', text: 'Custom wake word detection ("Hey Nexus") with SpeechRecognition-based continuous listening' },
      { icon: FaExchangeAlt, label: 'Silence Detection', text: 'Automatic 2-second silence detection triggers query submission for hands-free flow' },
    ]
  },
  {
    icon: FaBrain, title: 'Multi-Model AI', color: '#6366f1',
    desc: 'Seamlessly switch between multiple AI models mid-conversation. Each model brings unique strengths — from reasoning to creativity — routed through a unified interface.',
    subs: [
      { icon: SiOpenai, label: 'GPT-4o / GPT-4o-mini', text: 'OpenAI flagship models for broad reasoning, creativity, and complex task execution' },
      { icon: FaRocket, label: 'Llama 3.3 70B (Groq)', text: 'Blazing-fast inference on Groq hardware — ideal for low-latency conversations' },
      { icon: FaCloud, label: 'Gemini 1.5 Flash', text: 'Google multimodal model with native vision understanding and long-context windows' },
      { icon: FaDatabase, label: 'DeepSeek Chat', text: 'Open-weight model with strong coding benchmarks and structured reasoning' },
    ]
  },
  {
    icon: FaCogs, title: 'Agentic Tools', color: '#f472b6',
    desc: 'Real-time tool execution that extends AI capabilities beyond text. Search the web, check weather, retrieve facts, run code — all within the conversation.',
    subs: [
      { icon: FaSearch, label: 'Web Search', text: 'Live internet search via Tavily API with source citations and real-time content extraction' },
      { icon: FaCode, label: 'Code Execution', text: 'Multi-language code execution sandbox with output capture and error handling' },
      { icon: FaCloudSun, label: 'Weather & Facts', text: 'Real-time weather data retrieval, factual lookups, and knowledge graph queries' },
      { icon: FaHistory, label: 'Context-Aware Routing', text: 'Smart tool selection based on conversation context — no manual switching needed' },
    ]
  },
  {
    icon: FaShieldAlt, title: 'Persistent Memory', color: '#fbbf24',
    desc: 'Remembers who you are, what you prefer, and what you discussed. Cross-session memory ensures the assistant gets smarter with every interaction.',
    subs: [
      { icon: FaDatabase, label: 'Session Memory', text: 'Full conversation context maintained within each session for coherent multi-turn dialogue' },
      { icon: FaHistory, label: 'Conversation History', text: 'Browse, search, resume past conversations with timestamped history via MongoDB' },
      { icon: FaLock, label: 'User Preferences', text: 'Learns your model preferences, theme choices, and interaction patterns over time' },
      { icon: FaPalette, label: 'Cross-Session Recall', text: 'Relevant context persists across sessions — no need to repeat yourself' },
    ]
  },
  {
    icon: FaLock, title: 'Secure Authentication', color: '#ec4899',
    desc: 'Safe and reliable user sessions powered by Firebase Auth, securing your workspace, preferences, and personal memory dashboard from unauthorized access.',
    subs: [
      { icon: SiGithub, label: 'Google OAuth', text: 'One-click sign-in using your Google Account for instant, passwordless entry' },
      { icon: FaLock, label: 'Email / Password', text: 'Traditional signup and login with secure credential hashing and verification' },
      { icon: FaShieldAlt, label: 'Token-Based Auth', text: 'Stateful sessions validated via Firebase ID tokens verified on the backend' },
      { icon: FaHistory, label: 'Protected Routes', text: 'Restricts workspace pages, memory viewer, and conversation history to active users' },
    ]
  },
  {
    icon: FaCode, title: 'Markdown & Rich Rendering', color: '#3b82f6',
    desc: 'Enjoy clean, beautiful formatting of complex response payloads. Whether writing scripts, analyzing data tables, or reading code, it displays flawlessly.',
    subs: [
      { icon: FaCode, label: 'Syntax Highlighting', text: 'Rich visual styling for over 190+ programming languages powered by highlight.js' },
      { icon: FaBolt, label: 'One-Click Copy', text: 'Quickly copy code snippets directly to your clipboard with inline copy indicators' },
      { icon: FaDatabase, label: 'Structured Tables', text: 'Beautifully parsed markdown tables, bulleted lists, and heading hierarchies' },
      { icon: FaPalette, label: 'Vibrant Layouts', text: 'Glassmorphic panel containers and clean, readable typography designed for focus' },
    ]
  },
  {
    icon: FaGlobe, title: 'Multi-Language Support', color: '#a855f7',
    desc: 'Communicate in your preferred language. NexusAI understands and responds in multiple languages with native-level fluency across all supported AI models.',
    subs: [
      { icon: FaGlobe, label: '40+ Languages', text: 'Supports English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, and 30+ more' },
      { icon: FaRobot, label: 'Automatic Detection', text: 'Language auto-detection routes your input to the right linguistic model without manual selection' },
      { icon: FaExchangeAlt, label: 'Mixed-Language', text: 'Seamless handling of code-switching and mixed-language conversations within a single session' },
      { icon: FaHeadphones, label: 'Multi-Lingual TTS', text: 'Text-to-speech output supports multiple languages with natural intonation and pronunciation' },
    ]
  },
  {
    icon: FaFileAlt, title: 'File & Media Analysis', color: '#eab308',
    desc: 'Upload and analyze documents, images, and code files. Extract insights, generate summaries, and ask questions about your content in real time.',
    subs: [
      { icon: FaFileAlt, label: 'Document Parsing', text: 'Extract and analyze text from PDFs, DOCX, TXT, and code files with structured output' },
      { icon: FaRobot, label: 'Image Understanding', text: 'Vision-capable models analyze uploaded images, diagrams, screenshots, and photographs' },
      { icon: FaCode, label: 'Code Review', text: 'Upload source files for AI-powered code review, bug detection, and optimization suggestions' },
      { icon: FaCloud, label: 'Cloud Storage', text: 'Files stored securely via Cloudinary with shareable links and persistent access across sessions' },
    ]
  },
  {
    icon: FaLayerGroup, title: 'Workspace Organization', color: '#14b8a6',
    desc: 'Keep your AI workspace tidy. Multiple conversation threads, categorized memories, and searchable history make information retrieval effortless.',
    subs: [
      { icon: FaHistory, label: 'Session Grouping', text: 'Organize conversations into named sessions with tags, timestamps, and quick-resume capability' },
      { icon: FaSearch, label: 'Full-Text Search', text: 'Search across all past conversations, memories, and saved responses with instant results' },
      { icon: FaStar, label: 'Favorites & Bookmarks', text: 'Star important messages and bookmark critical responses for quick reference later' },
      { icon: FaDatabase, label: 'Export & Backup', text: 'Export conversation histories as JSON or markdown for offline backup and sharing' },
    ]
  },
]

const stats = [
  { value: 9, suffix: '+', label: 'AI Models Integrated', color: '#5ed29c' },
  { value: 6, suffix: '+', label: 'Agentic Tools', color: '#6366f1' },
  { value: 99, suffix: '%', label: 'Uptime Reliability', color: '#f472b6' },
  { value: 200, suffix: 'ms', label: 'Avg Response Start', color: '#fbbf24' },
  { value: 40, suffix: '+', label: 'Supported Languages', color: '#a855f7' },
  { value: 500, suffix: 'K', label: 'Tokens Processed Daily', color: '#14b8a6' },
  { value: 4, suffix: 'M', label: 'Max Context Tokens', color: '#ec4899' },
  { value: 190, suffix: '+', label: 'Syntax Highlighted Languages', color: '#3b82f6' },
]

const extras = [
  { icon: FaCloud, title: 'Real-Time Streaming', desc: 'Token-by-token response streaming via Socket.IO so you see results instantly, not after full generation.', color: '#5ed29c' },
  { icon: FaHeadphones, title: 'Multi-Platform', desc: 'Fully responsive across desktop, tablet, and mobile with adaptive layouts and touch-friendly controls.', color: '#6366f1' },
  { icon: FaLock, title: 'Privacy First', desc: 'End-to-end encrypted conversations. Your data is never used for training. Open-source code for full transparency.', color: '#f472b6' },
  { icon: FaPalette, title: 'Fully Customizable', desc: 'Dark/light theme, model selection, UI preferences, voice settings — tailor every aspect to your workflow.', color: '#fbbf24' },
  { icon: SiGithub, title: 'Open Source', desc: 'Built in the open with a permissive license. Self-host, audit, extend, or contribute to the project.', color: '#5ed29c' },
  { icon: FaExchangeAlt, title: 'Model Agnostic', desc: 'Designed to support any LLM provider. Add new models through the router without touching frontend logic.', color: '#6366f1' },
]

const timeline = [
  { step: 1, title: 'You Speak or Type', desc: 'Input is captured via keyboard or Web Speech API. Voice input is transcribed in real-time with wake-word activation.', color: '#5ed29c' },
  { step: 2, title: 'Router Selects Model', desc: 'The LLM router picks the optimal model based on your preference, task complexity, and provider availability.', color: '#6366f1' },
  { step: 3, title: 'AI Processes & Streams', desc: 'The model processes your query with full context. Tools execute in parallel — web search, code, or data retrieval.', color: '#f472b6' },
  { step: 4, title: 'Response Delivered', desc: 'Results stream token-by-token to the UI. TTS audio plays for voice mode. Conversation saved to memory.', color: '#fbbf24' },
]

export default function Features() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState('')

  const handleFeatureExpand = (title) => {
    if (expanded === title) return ''
    return title
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
          { label: 'Partners', ariaLabel: 'View partners', link: '/partners' },
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

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <ScrollFloat animationDuration={1} ease="back.inOut(2)" stagger={0.03}>
            <div className="inline-flex items-center gap-2 bg-white/[0.03] backdrop-blur-xl rounded-full px-5 py-2 mb-6 border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <ShinyText text="Everything NexusAI Can Do" speed={3} shineColor="#5ed29c" className="text-xs text-white/50" />
            </div>
          </ScrollFloat>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
              onMouseEnter={() => setExpanded(feat.title)}
              onMouseLeave={() => setExpanded('')}
              onFocus={() => setExpanded(feat.title)}
              onBlur={() => setExpanded('')}
              tabindex="0"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: feat.color + '20', color: feat.color }}>
                  <feat.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{feat.title}</h2>
                  <p className="text-white/40 text-sm">{feat.desc}</p>
                </div>
              </div>

              {expanded === feat.title && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {feat.subs.map((sub, si) => (
                      <React.Fragment key={si}>
                        <div className="text-white/30 text-xs font-medium uppercase tracking-wider">{sub.label}</div>
                        <p className="text-white/40 text-xs leading-relaxed mt-0.5">{sub.text}</p>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center transition-all duration-300 hover:border-white/20 hover:scale-[1.02]">
              <p className="text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>
                <CountUp to={stat.value} duration={2.5} suffix={stat.suffix} />
              </p>
              <p className="text-white/60 text-xs font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {extras.map((item) => {
            const Icon = item.icon
            return (
              <BorderGlow key={item.title} className="rounded-xl">
                <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 h-full group-hover:border-white/12 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: item.color + '15' }}>
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-white/35 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </BorderGlow>
            )
          })}
        </div>

        <div className="mt-8">
          <HowItWorks />
        </div>
      </div>
    </div>
  )
}

function HowItWorks() {
  return (
    <div className="mb-8">
      <div className="text-center mb-12">
        <ScrollFloat animationDuration={1} ease="back.inOut(2)" stagger={0.03}>
          <div className="inline-flex items-center gap-2 bg-white/[0.03] backdrop-blur-xl rounded-full px-5 py-2 mb-6 border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6] animate-pulse" />
            <ShinyText text="How NexusAI Works" speed={3} shineColor="#f472b6" className="text-xs text-white/50" />
          </div>
        </ScrollFloat>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
          <GradientText colors={['#5ed29c', '#6366f1', '#f472b6', '#5ed29c']} animationSpeed={6} direction="horizontal">
            How NexusAI Works
          </GradientText>
        </h2>
        <p className="text-white/30 max-w-xl mx-auto">Four steps from your query to an intelligent response.</p>
      </div>

      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#5ed29c] via-[#6366f1] to-[#fbbf24] opacity-20 hidden md:block" />

        <div className="space-y-6">
          {timeline.map((item) => (
            <div className="group relative flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-all duration-700" style={{ background: item.color }} />
                <div className="relative w-[48px] h-[48px] rounded-full flex items-center justify-center border text-sm font-bold" style={{ borderColor: item.color + '40', background: item.color + '15', color: item.color }}>
                  {item.step}
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-2">
                <h3 className="text-white font-semibold text-base mb-1.5">{item.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}