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
    links?: { title: string; url: string }[];
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
      if (!question.trim()) {
        throw new Error("質問が入力されていません");
      }

      setIsLoading(true);
      setError(null);

      // ユーザーのメッセージをチャットに追加
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: question,
      };

      setMessages((prev) => [...prev, userMessage]);

      // /api/ai エンドポイントへリクエスト
      let contextInfo = "";
      if (documentId) {
        contextInfo = `関連書類ID: ${documentId}. `;
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `${contextInfo}${question}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `APIリクエストに失敗しました (${response.status})`
        );
      }

      const data = await response.json();

      // AIの応答をチャットに追加
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.answer || data.text || "回答を取得できませんでした",
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error("AIアシスタントエラー:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("AIアシスタントとの通信中にエラーが発生しました")
      );
    } finally {
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
