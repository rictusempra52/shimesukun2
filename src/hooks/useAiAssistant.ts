"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // UUIDを生成するために必要

// チャットメッセージの型定義
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: any; // 文字列またはオブジェクトに対応するためanyに変更
}

/** AIアシスタントの状態と機能を管理するカスタムフック
 * @param documentId - 関連書類のID（オプション）
 * @returns {
 *   messages: ChatMessage[]; // チャットメッセージの配列
 *   sendQuestion: (question: string) => Promise<void>; // 質問を送信する関数
 *   clearChat: () => void; // チャットをクリアする関数
 *   isLoading: boolean; // ローディング状態
 *   error: Error | null; // エラー情報
 * }
 */

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
      console.log("API レスポンス:", data); // デバッグログを追加

      // APIレスポンスの処理を改善
      // データがそのままオブジェクトとして利用できるように
      const aiContent = data;

      // AIの応答をチャットに追加
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: aiContent, // オブジェクトをそのまま保存
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
