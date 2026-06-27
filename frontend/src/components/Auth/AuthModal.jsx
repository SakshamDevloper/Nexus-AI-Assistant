import { useState } from 'react'
import { Xmark, Envelope, Google, Spinner } from '../../icons'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-glow rounded-2xl w-full max-w-sm mx-4 p-8 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/20 hover:text-white/50 transition-colors">
          <Xmark size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/25">
            <span className="text-xl font-bold text-bg-deep">N</span>
          </div>
          <h2 className="text-xl font-semibold text-white">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-sm text-white/40 mt-1">
            {mode === 'login' ? 'Sign in to continue to NexusAI' : 'Start your journey with NexusAI'}
          </p>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 animate-slide-up">
            <p className="text-xs text-red-400">{authError}</p>
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-50 mb-4 border border-white/10 hover:border-white/20"
        >
          {submitting ? <Spinner size={16} className="animate-spin" /> : <Google size={16} />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-xs text-white/20">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-bg-deep font-semibold rounded-xl px-4 py-2.5 text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
          >
            {submitting && <Spinner size={14} className="animate-spin" />}
            <Envelope size={14} />
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-white/30 text-center mt-5">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setAuthError(null) }} className="text-accent hover:underline font-medium">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
