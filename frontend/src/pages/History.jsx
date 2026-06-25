import { useEffect, useState } from 'react'
import { Clock, Trash2, MessageSquare, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../stores/chatStore'

export default function History() {
  const navigate = useNavigate()
  const { sessions, loadSession, deleteSession, newSession } = useChatStore()
  const [sortedSessions, setSortedSessions] = useState([])

  useEffect(() => {
    setSortedSessions(
      [...sessions].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
    )
  }, [sessions])

  const handleOpen = (sessionId) => {
    loadSession(sessionId)
    navigate('/assistant')
  }

  const groupByDate = (sessions) => {
    const groups = {}
    const now = new Date()
    const today = now.toDateString()
    const yesterday = new Date(now - 86400000).toDateString()

    sessions.forEach(s => {
      const date = new Date(s.updatedAt || s.createdAt)
      const dateStr = date.toDateString()
      let label

      if (dateStr === today) label = 'Today'
      else if (dateStr === yesterday) label = 'Yesterday'
      else label = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

      if (!groups[label]) groups[label] = []
      groups[label].push(s)
    })

    return groups
  }

  const groups = groupByDate(sortedSessions)

  return (
    <div className="min-h-screen bg-bg-deep text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">History</h1>
            <p className="text-sm text-white/40 mt-1">{sessions.length} conversations</p>
          </div>
          <button
            onClick={() => newSession()}
            className="bg-accent text-bg-deep font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all"
          >
            + New Chat
          </button>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No conversation history yet</p>
            <button
              onClick={() => navigate('/assistant')}
              className="text-accent text-sm mt-2 hover:underline"
            >
              Start a new chat →
            </button>
          </div>
        ) : (
          Object.entries(groups).map(([label, groupSessions]) => (
            <div key={label} className="mb-8">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">{label}</h3>
              <div className="space-y-1">
                {groupSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group flex items-center gap-3 glass rounded-xl px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleOpen(session.id)}
                  >
                    <MessageSquare size={14} className="text-white/20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">{session.title || 'New Chat'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-white/20" />
                        <span className="text-[10px] text-white/20">
                          {session.messages?.length || 0} messages
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
