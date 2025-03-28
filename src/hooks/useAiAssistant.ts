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
  structuredContent?: {
    回答要点: string;
    法的・実務的根拠: string;
    実行プラン: {
      すぐに実行すべきこと: string;
      中期的に検討すべきこと: string;
      長期的に準備すべきこと: string;
    };
    注意点とリスク: {
      想定されるトラブルや注意点: string;
      法的リスクや責任の所在: string;
    };
    管理実務上のポイント: {
      書類作成・保管に関するアドバイス: string;
      区分所有者への説明方法: string;
      意思決定プロセスの進め方: string;
    };
    参考事例: string;
  };
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
        content: data.回答要点 || "回答が生成できませんでした。",
        timestamp: new Date().toISOString(),
        structuredContent: data,
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
