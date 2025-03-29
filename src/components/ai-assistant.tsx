"use client";

// 必要なReactフックとコンポーネントをインポート - 最小限に保つ
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Send, Sparkles, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAiAssistant } from "@/hooks/useAiAssistant";

// プロパティ型定義
interface AiAssistantProps {
    documentId?: string;
    documentTitle?: string;
}

// 基本的な機能を持ったAIアシスタントコンポーネント
export function AiAssistant({ documentId, documentTitle }: AiAssistantProps) {
    const [question, setQuestion] = useState("");
    const { messages, sendQuestion, clearChat, isLoading, error } = useAiAssistant(documentId);

    // フォーム送信ハンドラ
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            sendQuestion(question);
            setQuestion("");
        }
    };

    return (
        <div className="flex flex-col h-[600px] rounded-lg border bg-card text-card-foreground shadow-sm">
            {/* ヘッダー */}
            <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AIアシスタント
                    </h3>
                    {documentTitle && (
                        <Badge variant="outline" className="ml-auto">
                            書類: {documentTitle}
                        </Badge>
                    )}
                </div>
            </div>

            {/* メインコンテンツ - シンプル化 */}
            <div className="flex-grow p-6 overflow-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Sparkles className="h-10 w-10 mb-2" />
                        <h3 className="font-medium mb-1">マンション管理について質問できます</h3>
                        <p className="text-sm">
                            例: 「修繕積立金の値上げ方法は？」「管理組合の理事会議事録の保管期間は？」
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[90%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-lg p-3 bg-muted">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                                        <span className="text-sm text-muted-foreground">回答を生成中...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {typeof error === 'string'
                                ? error
                                : (error as Error).message || 'AIリクエスト中にエラーが発生しました'}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* フッター - 入力フォーム */}
            <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearChat}
                        title="会話をクリア"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                    <Input
                        placeholder="質問を入力してください..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isLoading}
                        className="flex-grow"
                    />
                    <Button type="submit" size="icon" disabled={!question.trim() || isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
