import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultModels = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', tier: 'premium' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'fast' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'free' },
  { id: 'llama-3.3', name: 'Llama 3.3 70B', provider: 'Groq', tier: 'free' },
  { id: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'Google', tier: 'free' },
]

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      selectedModel: 'gpt-4o-mini',
      availableModels: defaultModels,
      voiceEnabled: true,
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      theme: 'dark',
      autoSpeak: true,
      language: 'en-US',
      apiKeys: {},

      setSelectedModel: (modelId) => set({ selectedModel: modelId }),
      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      setVoiceSpeed: (speed) => set({ voiceSpeed: speed }),
      setVoicePitch: (pitch) => set({ voicePitch: pitch }),
      setAutoSpeak: (enabled) => set({ autoSpeak: enabled }),
      setLanguage: (lang) => set({ language: lang }),
      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key }
      })),
      addCustomModel: (model) => set((state) => ({
        availableModels: [...state.availableModels, model]
      })),
    }),
    { name: 'nexus-ai-settings' }
  )
)