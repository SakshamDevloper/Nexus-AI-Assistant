import { useEffect, useState } from 'react'
import { TrashCan, Brain, User, Clock, Xmark } from '../../icons'

export default function MemoryPanel({ onClose }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/memory')
      .then(res => res.json())
      .then(data => {
        setMemories(data.memories || [])
        setLoading(false)
      })
      .catch(() => {
        setMemories([
          { key: 'user_name', value: 'User', type: 'preference', updatedAt: Date.now() },
          { key: 'preferred_language', value: 'JavaScript', type: 'preference', updatedAt: Date.now() - 86400000 },
        ])
        setLoading(false)
      })
  }, [])

  const handleDelete = async (key) => {
    try {
      await fetch(`/api/memory/${key}`, { method: 'DELETE' })
    } catch {}
    setMemories(prev => prev.filter(m => m.key !== key))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-white">Memory</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <Xmark size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : memories.length === 0 ? (
            <p className="text-center text-sm text-white/30 py-8">No memories yet. Chat with NexusAI to build your profile.</p>
          ) : (
            memories.map((mem) => (
              <div key={mem.key} className="glass rounded-xl p-3 flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  {mem.type === 'user' ? <User size={14} className="text-accent" /> : <Brain size={14} className="text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/70 capitalize">{mem.key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-white mt-0.5">{mem.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="text-white/20" />
                    <span className="text-[10px] text-white/20">
                      {mem.updatedAt ? new Date(mem.updatedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(mem.key)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400"
                >
                  <TrashCan size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
