import { Globe, CloudSun, BookOpen, Search, Loader2 } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'

const toolIcons = {
  web_search: Search,
  get_weather: CloudSun,
  wikipedia_lookup: BookOpen,
}

const toolLabels = {
  web_search: 'Web Search',
  get_weather: 'Weather',
  wikipedia_lookup: 'Wikipedia',
}

export default function ToolBar() {
  const { pendingToolCalls } = useChatStore()

  const activeTools = pendingToolCalls.filter(tc => tc.status === 'pending')
  const completedTools = pendingToolCalls.filter(tc => tc.status === 'completed')

  return (
    <div className="flex items-center gap-2">
      {activeTools.length > 0 && (
        <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
          <Loader2 size={12} className="text-accent animate-spin" />
          <span className="text-[11px] text-white/50">
            {activeTools.length} tool{activeTools.length > 1 ? 's' : ''} active
          </span>
        </div>
      )}

      {completedTools.slice(-2).map((tc) => {
        const Icon = toolIcons[tc.name] || Globe
        return (
          <div key={tc.id} className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
            <Icon size={10} className="text-accent" />
            <span className="text-[10px] text-white/40">{toolLabels[tc.name] || tc.name}</span>
          </div>
        )
      })}
    </div>
  )
}
