"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
}

// WebSpeech APIのインターフェース定義
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  
  // 音声認識のメインインターフェース
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

  // 音声認識イベントのインターフェース
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList
    readonly resultIndex: number
  }

  // 音声認識結果のリスト（Array-likeオブジェクト）
  interface SpeechRecognitionResultList {
    readonly [index: number]: SpeechRecognitionResult  // インデックスアクセス（読み取り専用）
    readonly length: number                            // 結果の数（読み取り専用）
    item(index: number): SpeechRecognitionResult      // インデックスで結果を取得
  }

  // 個々の音声認識結果
  interface SpeechRecognitionResult {
    readonly [index: number]: SpeechRecognitionAlternative  // 候補のインデックスアクセス
    readonly length: number                                 // 候補の数
    readonly isFinal: boolean                              // 最終結果かどうか
    item(index: number): SpeechRecognitionAlternative      // 候補を取得
  }

  // 音声認識の候補
  interface SpeechRecognitionAlternative {
    readonly transcript: string  // 認識されたテキスト
    readonly confidence: number  // 信頼度
  }

  // エラーイベント
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode  // エラーコード
  }

  // エラーの種類
  type SpeechRecognitionErrorCode =
    | "no-speech"               // 音声が検出されない
    | "aborted"                // 中断された
    | "audio-capture"          // マイクの問題
    | "network"               // ネットワークエラー
    | "not-allowed"           // 権限なし
    | "service-not-allowed"   // サービス利用不可
    | "bad-grammar"           // 文法エラー
    | "language-not-supported" // 言語未対応
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
