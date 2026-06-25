import { useState, useRef, useEffect, useCallback } from 'react'

export function useSpeechRecognition(options = {}) {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
    onStart,
    onEnd,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = language
    recognitionRef.current.continuous = continuous
    recognitionRef.current.interimResults = interimResults

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setError(null)
      onStart?.()
    }

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
        onResult?.(finalTranscript, true)
      }
      setInterimTranscript(interim)
      if (interim) onResult?.(interim, false)
    }

    recognitionRef.current.onerror = (event) => {
      setError(event.error)
      onError?.(event.error)
      if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
        setIsListening(false)
      }
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      onEnd?.()
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, continuous, interimResults, onResult, onError, onStart, onEnd])

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setInterimTranscript('')
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Speech recognition start error:', e)
      }
    }
  }, [isListening])

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    finalTranscript: transcript + interimTranscript,
    error,
    start,
    stop,
    reset,
  }
}