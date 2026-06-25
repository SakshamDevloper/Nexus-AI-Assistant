import { useState } from 'react'
import { X, Mail, Chrome, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState(null)
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth()

  const handleGoogle = async () => {
    setSubmitting(true)
    setAuthError(null)
    try {
      await loginWithGoogle()
      onClose()
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setAuthError(null)
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password)
      } else {
        await registerWithEmail(email, password)
      }
      onClose()
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl w-full max-w-sm mx-4 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold text-bg-deep">N</span>
          </div>
          <h2 className="text-lg font-semibold text-white">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-sm text-white/40 mt-1">
            {mode === 'login' ? 'Sign in to continue to NexusAI' : 'Start your journey with NexusAI'}
          </p>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mb-4">
            <p className="text-xs text-red-400">{authError}</p>
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 mb-4"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-bg-deep font-semibold rounded-xl px-4 py-2.5 text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            <Mail size={14} />
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-white/30 text-center mt-4">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setAuthError(null) }} className="text-accent hover:underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
