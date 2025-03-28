"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { askAI } from "@/lib/client/dify"; // クライアント用の関数をインポート

// ChatMessageの型定義
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/**
 * AIアシスタント機能を提供するカスタムフック
 */
export function useAiAssistant(documentId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // API呼び出しのミューテーション
  const mutation = useMutation({
    mutationFn: (question: string) => askAI(question),
    onSuccess: (data) => {
      // 成功時の処理
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
  });

  // 質問を送信する関数
  const sendQuestion = (question: string) => {
    // ユーザーの質問をメッセージリストに追加
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // APIに質問を送信
    mutation.mutate(question);
  };

  // 会話履歴をクリアする関数
  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendQuestion,
    clearChat,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
