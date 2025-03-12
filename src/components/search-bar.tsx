"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
}

// Declare SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
    start: () => void
    stop: () => void
    abort: () => void
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
    length: number
    item(index: number): SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    length: number
    isFinal: boolean
    item(index: number): SpeechRecognitionAlternative
  }

  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: SpeechRecognitionErrorCode
  }

  type SpeechRecognitionErrorCode =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported"
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  // Web Speech API の初期化
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "ja-JP"

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcriptValue = result[0].transcript
        setTranscript(transcriptValue)

        if (result.isFinal) {
          onSearch(transcriptValue)
          setIsListening(false)
        }
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("音声認識エラー:", event.error)
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [onSearch])

  const toggleListening = () => {
    if (!recognition) {
      alert("お使いのブラウザは音声認識をサポートしていません。")
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setTranscript("")
      recognition.start()
      setIsListening(true)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        type="button"
        variant={isListening ? "destructive" : "default"}
        size="lg"
        onClick={toggleListening}
        className={`w-full flex items-center justify-center gap-2 ${isListening ? "animate-pulse" : ""}`}
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5" />
            <span>音声入力を停止</span>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            <span>音声で検索</span>
          </>
        )}
      </Button>

      {transcript && (
        <div className="bg-muted p-3 rounded-md text-sm w-full min-h-[40px] flex items-center">
          <p className="break-words">{transcript}</p>
        </div>
      )}
    </div>
  )
}

