"use client";

// 必要なReactフックとコンポーネントをインポート - 最小限に保つ
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Send, Sparkles, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAiAssistant } from "@/hooks/useAiAssistant";

// JSONかどうかを判断するヘルパー関数
function isJsonString(str: string): boolean {
    try {
        const json = JSON.parse(str);
        return typeof json === 'object' && json !== null;
    } catch (e) {
        return false;
    }
}

// JSON表示用コンポーネント
interface JsonDisplayProps {
    content: string;
}

function JsonDisplay({ content }: JsonDisplayProps) {
    try {
        const json = JSON.parse(content);

        return (
            <div className="text-sm space-y-4">
                {json["回答要点"] && (
                    <div>
                        <h4 className="font-bold mb-1 text-base">回答要点</h4>
                        <p className="whitespace-pre-wrap">{json["回答要点"]}</p>
                    </div>
                )}

                {json["法的実務的根拠"] && (
                    <div>
                        <h4 className="font-bold mb-1 text-base">法的実務的根拠</h4>
                        <p className="whitespace-pre-wrap">{json["法的実務的根拠"]}</p>
                    </div>
                )}

                {json["実行プラン"] && (
                    <div>
                        <h4 className="font-bold mb-1 text-base">実行プラン</h4>
                        <div className="pl-4 space-y-2">
                            {json["実行プラン"]["すぐに実行すべきこと"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ すぐに実行すべきこと</h5>
                                    <p className="whitespace-pre-wrap">{json["実行プラン"]["すぐに実行すべきこと"]}</p>
                                </div>
                            )}
                            {json["実行プラン"]["中期的に検討すべきこと"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 中期的に検討すべきこと</h5>
                                    <p className="whitespace-pre-wrap">{json["実行プラン"]["中期的に検討すべきこと"]}</p>
                                </div>
                            )}
                            {json["実行プラン"]["長期的に準備すべきこと"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 長期的に準備すべきこと</h5>
                                    <p className="whitespace-pre-wrap">{json["実行プラン"]["長期的に準備すべきこと"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {json["注意点とリスク"] && (
                    <div>
                        <h4 className="font-bold mb-1 text-base">注意点とリスク</h4>
                        <div className="pl-4 space-y-2">
                            {json["注意点とリスク"]["想定されるトラブルや注意点"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 想定されるトラブルや注意点</h5>
                                    <p className="whitespace-pre-wrap">{json["注意点とリスク"]["想定されるトラブルや注意点"]}</p>
                                </div>
                            )}
                            {json["注意点とリスク"]["法的リスクや責任の所在"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 法的リスクや責任の所在</h5>
                                    <p className="whitespace-pre-wrap">{json["注意点とリスク"]["法的リスクや責任の所在"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {json["管理実務上のポイント"] && (
                    <div>
                        <h4 className="font-bold mb-1 text-base">管理実務上のポイント</h4>
                        <div className="pl-4 space-y-2">
                            {json["管理実務上のポイント"]["書類作成・保管に関するアドバイス"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 書類作成・保管に関するアドバイス</h5>
                                    <p className="whitespace-pre-wrap">{json["管理実務上のポイント"]["書類作成・保管に関するアドバイス"]}</p>
                                </div>
                            )}
                            {json["管理実務上のポイント"]["区分所有者への説明方法"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 区分所有者への説明方法</h5>
                                    <p className="whitespace-pre-wrap">{json["管理実務上のポイント"]["区分所有者への説明方法"]}</p>
                                </div>
                            )}
                            {json["管理実務上のポイント"]["意思決定プロセスの進め方"] && (
                                <div>
                                    <h5 className="font-medium text-sm">■ 意思決定プロセスの進め方</h5>
                                    <p className="whitespace-pre-wrap">{json["管理実務上のポイント"]["意思決定プロセスの進め方"]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {json["参考事例"] && (
                    <div>
                        <h4 className="font-bold mb-1 text-base">参考事例</h4>
                        <p className="whitespace-pre-wrap">{json["参考事例"]}</p>
                    </div>
                )}

                {/* 旧形式のJSONにも対応するためのフォールバック */}
                {json.title && !json["回答要点"] && (
                    <h4 className="font-medium mb-2">{json.title}</h4>
                )}
                {json.content && !json["回答要点"] && (
                    <div className="whitespace-pre-wrap mb-2">{json.content}</div>
                )}
                {json.items && Array.isArray(json.items) && (
                    <ul className="list-disc pl-5 space-y-1">
                        {json.items.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                )}
                {json.links && Array.isArray(json.links) && (
                    <div className="mt-3 pt-2 border-t">
                        <p className="font-medium mb-1">参考リンク:</p>
                        <ul className="list-disc pl-5">
                            {json.links.map((link: { title: string, url: string }, index: number) => (
                                <li key={index}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {link.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    } catch (e) {
        return <div className="whitespace-pre-wrap">{content}</div>;
    }
}

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

    // 基本的なUIを再構築
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
                                    {message.role === "assistant" && isJsonString(message.content) ? (
                                        <JsonDisplay content={message.content} />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    )}
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
                        <AlertDescription>{(error as Error).message}</AlertDescription>
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
