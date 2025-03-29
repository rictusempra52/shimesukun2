"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // UUIDを生成するために必要

// チャットメッセージの型定義
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredContent?: {
    回答要点?: string;
    法的実務的根拠?: string;
    実行プラン?: {
      すぐに実行すべきこと?: string;
      中期的に検討すべきこと?: string;
      長期的に準備すべきこと?: string;
    };
    注意点とリスク?: {
      想定されるトラブルや注意点?: string;
      法的リスクや責任の所在?: string;
    };
    管理実務上のポイント?: {
      書類作成保管に関するアドバイス?: string;
      区分所有者への説明方法?: string;
      意思決定プロセスの進め方?: string;
    };
    参考事例?: string;
  };
}

// AIアシスタントの状態と機能を管理するカスタムフック
export function useAiAssistant(documentId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 質問を送信する関数
  const sendQuestion = async (question: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // ユーザーのメッセージをチャットに追加
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: question,
      };

      setMessages((prev) => [...prev, userMessage]);

      // モックレスポンスを生成（本番では実際のAPIを呼び出す）
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: `「${question}」についてお答えします。`,
          structuredContent: {
            回答要点:
              "これはデモ回答です。実際のAPIが実装されると、ここに本物の回答が表示されます。",
            法的実務的根拠: "区分所有法と標準管理規約に基づいています。",
            実行プラン: {
              すぐに実行すべきこと: "理事会で議題として検討する",
              中期的に検討すべきこと: "専門家への相談を検討する",
              長期的に準備すべきこと: "長期修繕計画への組み込み",
            },
          },
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error("AIアシスタントエラー:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("AIアシスタントとの通信中にエラーが発生しました")
      );
      setIsLoading(false);
    }
  };

  // チャットをクリアする関数
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    sendQuestion,
    clearChat,
    isLoading,
    error,
  };
}
