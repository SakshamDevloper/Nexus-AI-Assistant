import { useCallback, useRef, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useChatStore } from '../stores/chatStore'
import { useSettingsStore } from '../stores/settingsStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export function useAgentStream() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const accumRef = useRef({})

  const { addMessage, updateMessage, setStreaming, addToolCall, updateToolCall, clearToolCalls } = useChatStore()
  const { selectedModel } = useSettingsStore()

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      setError(null)
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    socketRef.current.on('connect_error', (err) => {
      setError(err.message)
    })

    socketRef.current.on('token', (data) => {
      if (!accumRef.current[data.messageId]) {
        accumRef.current[data.messageId] = ''
      }
      accumRef.current[data.messageId] += data.content
      updateMessage(data.messageId, { content: accumRef.current[data.messageId], streaming: true })
    })

    socketRef.current.on('message_complete', (data) => {
      const finalContent = accumRef.current[data.messageId] || data.fullContent || data.content || ''
      updateMessage(data.messageId, { streaming: false, content: finalContent })
      delete accumRef.current[data.messageId]
      setStreaming(false)
    })

    socketRef.current.on('tool_call', (data) => {
      addToolCall({
        id: data.callId,
        name: data.name,
        arguments: data.arguments,
        status: 'pending',
      })
    })

    socketRef.current.on('tool_result', (data) => {
      updateToolCall(data.callId, { status: 'completed', result: data.result })
    })

    socketRef.current.on('error', (data) => {
      setError(data.message)
      setStreaming(false)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [addMessage, updateMessage, setStreaming, addToolCall, updateToolCall])

  const sendMessage = useCallback(async (content, attachments = []) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server')
      return
    }

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

    socketRef.current.emit('chat', {
      messageId: assistantMessageId,
      content,
      model: selectedModel,
      history: useChatStore.getState().messages.slice(-20),
    })
  }, [addMessage, setStreaming, clearToolCalls, selectedModel])

  return {
    isConnected,
    error,
    sendMessage,
  }
}
