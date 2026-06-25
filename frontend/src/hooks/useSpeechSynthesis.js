import { useState, useRef, useCallback, useEffect } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const utteranceRef = useRef(null)
  const onEndCallbackRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (!selectedVoice && availableVoices.length > 0) {
        const preferred = availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
          availableVoices.find(v => v.lang.startsWith('en')) ||
          availableVoices[0]
        setSelectedVoice(preferred)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [selectedVoice])

  const speak = useCallback((text, options = {}) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const {
      voice = selectedVoice,
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      onEnd,
      onStart,
      onError,
    } = options

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice || null
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onstart = () => {
      setIsSpeaking(true)
      onStart?.()
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      onEndCallbackRef.current?.()
      onEnd?.()
    }

    utterance.onerror = (event) => {
      setIsSpeaking(false)
      onError?.(event.error)
    }

    onEndCallbackRef.current = onEnd
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [selectedVoice])

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume()
    }
  }, [])

  return {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    cancel,
    pause,
    resume,
  }
}