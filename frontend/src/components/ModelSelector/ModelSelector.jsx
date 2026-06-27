import { useSettingsStore } from '../../stores/settingsStore'
import { ChevronDown, Sparkles, Brain, Robot, Bolt } from '../../icons'
import { useState } from 'react'

const modelIcons = {
  'gpt-4o': Bolt,
  'gpt-4o-mini': Bolt,
  'deepseek': Brain,
  'llama-3.3': Robot,
  'gemini-flash': Sparkles,
}

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, availableModels } = useSettingsStore()
  const [open, setOpen] = useState(false)

  const current = availableModels.find(m => m.id === selectedModel)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 glass rounded-full px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
      >
        <Sparkles size={12} className="text-accent" />
        <span className="text-white/80 text-xs font-medium">
          {current?.name || 'Select Model'}
        </span>
        <ChevronDown size={12} className="text-white/40" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 z-50 glass-strong rounded-xl p-2 shadow-2xl">
            {availableModels.map((model) => {
              const Icon = modelIcons[model.id] || Robot
              return (
                <button
                  key={model.id}
                  onClick={() => { setSelectedModel(model.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    model.id === selectedModel
                      ? 'bg-accent/10 text-accent'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <Icon size={16} className="text-current" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{model.name}</p>
                    <p className="text-[10px] text-white/30">{model.provider} . {model.tier}</p>
                  </div>
                  {model.id === selectedModel && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
