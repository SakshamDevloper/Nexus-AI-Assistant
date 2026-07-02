import { useCallback, useRef, useState, useEffect } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'

export function useAgentStream() {
  const abortRef = useRef(null)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState(null)

  const { addMessage, updateMessage, setStreaming, addToolCall, updateToolCall, clearToolCalls } = useChatStore()
  const { selectedModel } = useSettingsStore()

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const sendMessage = useCallback(async (content, attachments = []) => {
    const userMessageId = crypto.randomUUID()
    addMessage({
      id: userMessageId,
      role: 'user',
      content,
      attachments,
    })

    const assistantMessageId = crypto.randomUUID()
    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      streaming: true,
    })

    setStreaming(true)
    clearToolCalls()

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      setError(null)
      setIsConnected(true)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          content,
          model: selectedModel,
          history: useChatStore.getState().messages.slice(-20),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Chat request failed')
      }

      data.toolCalls?.forEach((toolCall) => {
        addToolCall({
          id: toolCall.id,
          name: toolCall.name,
          arguments: JSON.stringify(toolCall.arguments || {}),
          status: 'pending',
        })
        updateToolCall(toolCall.id, {
          status: 'completed',
          result: JSON.stringify(toolCall.result || {}),
        })
      })

      updateMessage(assistantMessageId, {
        content: data.fullContent || data.content || '',
        streaming: false,
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      setIsConnected(false)
      setError(err.message)
      updateMessage(assistantMessageId, {
        content: `Error: ${err.message}`,
        streaming: false,
      })
    } finally {
      setStreaming(false)
    }
  }, [addMessage, updateMessage, setStreaming, addToolCall, updateToolCall, clearToolCalls, selectedModel])

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
  }, [setStreaming])

  return {
    isConnected,
    error,
    sendMessage,
    stopGeneration,
  }
}
