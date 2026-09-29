import { useCallback, useRef, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'
import { randomId } from '../utils/randomId'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

export function useAgentStream() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(false)

  const { addMessage, updateMessage, setStreaming, addToolCall, updateToolCall, clearToolCalls } = useChatStore()
  const { selectedModel } = useSettingsStore()

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
      setIsConnected(false)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const sendMessage = useCallback(async (content) => {
    const state = useChatStore.getState()
    const msgId = randomId()

    addMessage({ id: randomId(), role: 'user', content })
    addMessage({ id: msgId, role: 'assistant', content: '', streaming: true })

    setStreaming(true)
    clearToolCalls()
    setError(null)
    abortRef.current = false

    const socket = socketRef.current
    if (!socket || !socket.connected) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            content,
            model: selectedModel,
            history: state.messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Chat request failed')
        updateMessage(msgId, { content: data.content || '', streaming: false })
      } catch (err) {
        setError(err.message)
        updateMessage(msgId, { content: `Error: ${err.message}`, streaming: false })
      } finally {
        setStreaming(false)
      }
      return
    }

    const messageId = msgId
    let fullContent = ''

    const onToken = (data) => {
      if (abortRef.current) return
      fullContent += data.content
      updateMessage(messageId, { content: fullContent })
    }

    const onToolCall = (data) => {
      if (abortRef.current) return
      addToolCall({ id: data.callId, name: data.name, arguments: data.arguments, status: 'running' })
    }

    const onToolResult = (data) => {
      if (abortRef.current) return
      updateToolCall(data.callId, { status: 'completed', result: data.result })
    }

    const onComplete = (data) => {
      if (abortRef.current) return
      updateMessage(messageId, { content: data.fullContent || data.content || fullContent, streaming: false })
      setStreaming(false)
      cleanup()
    }

    const onError = (data) => {
      if (abortRef.current) return
      setError(data.message)
      updateMessage(messageId, { content: `Error: ${data.message}`, streaming: false })
      setStreaming(false)
      cleanup()
    }

    const cleanup = () => {
      socket.off('token', onToken)
      socket.off('tool_call', onToolCall)
      socket.off('tool_result', onToolResult)
      socket.off('message_complete', onComplete)
      socket.off('error', onError)
    }

    socket.on('token', onToken)
    socket.on('tool_call', onToolCall)
    socket.on('tool_result', onToolResult)
    socket.on('message_complete', onComplete)
    socket.on('error', onError)

    socket.emit('chat', {
      messageId,
      content,
      model: selectedModel,
      history: state.messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    })

    const checkInterval = setInterval(() => {
      if (!socket.connected || abortRef.current) {
        cleanup()
        clearInterval(checkInterval)
        setStreaming(false)
      }
    }, 500)

    state._cleanupStream = () => {
      cleanup()
      clearInterval(checkInterval)
    }
  }, [addMessage, updateMessage, setStreaming, addToolCall, updateToolCall, clearToolCalls, selectedModel])

  const stopGeneration = useCallback(() => {
    abortRef.current = true
    setStreaming(false)
    const state = useChatStore.getState()
    if (state._cleanupStream) {
      state._cleanupStream()
      state._cleanupStream = null
    }
    const socket = socketRef.current
    if (socket) {
      socket.off('token')
      socket.off('tool_call')
      socket.off('tool_result')
      socket.off('message_complete')
    }
  }, [setStreaming])

  return { isConnected, error, sendMessage, stopGeneration }
}
