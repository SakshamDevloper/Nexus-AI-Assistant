import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      currentSessionId: null,
      sessions: [],
      isStreaming: false,
      pendingToolCalls: [],

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: message.id || crypto.randomUUID(), timestamp: Date.now() }]
      })),

      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      removeMessage: (id) => set((state) => ({
        messages: state.messages.filter(m => m.id !== id)
      })),

      clearMessages: () => set({ messages: [] }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      addToolCall: (toolCall) => set((state) => ({
        pendingToolCalls: [...state.pendingToolCalls, toolCall]
      })),

      updateToolCall: (id, updates) => set((state) => ({
        pendingToolCalls: state.pendingToolCalls.map(tc => tc.id === id ? { ...tc, ...updates } : tc)
      })),

      clearToolCalls: () => set({ pendingToolCalls: [] }),

      saveSession: () => {
        const { messages, currentSessionId, sessions } = get()
        if (messages.length === 0) return

        const session = {
          id: currentSessionId || crypto.randomUUID(),
          title: messages[0]?.content?.slice(0, 50) || 'New Chat',
          messages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        const existingIndex = sessions.findIndex(s => s.id === session.id)
        let updatedSessions = [...sessions]
        if (existingIndex >= 0) {
          updatedSessions[existingIndex] = session
        } else {
          updatedSessions.unshift(session)
        }
        set({ sessions: updatedSessions, currentSessionId: session.id })
      },

      loadSession: (sessionId) => {
        const { sessions } = get()
        const session = sessions.find(s => s.id === sessionId)
        if (session) {
          set({ messages: session.messages, currentSessionId: session.id })
        }
      },

      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        messages: state.currentSessionId === sessionId ? [] : state.messages
      })),

      newSession: () => set({ messages: [], currentSessionId: null }),
    }),
    { name: 'nexus-ai-chat', partialize: (state) => ({ sessions: state.sessions }) }
  )
)