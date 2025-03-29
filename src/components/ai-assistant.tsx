"use client"; // Next.jsのクライアントコンポーネントとして動作することを指定

// 必要なReactフックとコンポーネントをインポート
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button"; // ボタンコンポーネント
import { Input } from "@/components/ui/input"; // 入力フィールドコンポーネント
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // カードコンポーネント群
import { ScrollArea } from "@/components/ui/scroll-area"; // スクロール可能なエリア
import { Badge } from "@/components/ui/badge"; // バッジコンポーネント
import { AlertCircle, Send, Sparkles, Trash } from "lucide-react"; // アイコン
import { Alert, AlertDescription } from "@/components/ui/alert"; // アラートコンポーネント
import { useAiAssistant, ChatMessage } from "@/hooks/useAiAssistant"; // AIアシスタント用のカスタムフック

// コンポーネントのプロパティ型定義
interface AiAssistantProps {
    documentId?: string; // 書類ID（オプション）
    documentTitle?: string; // 書類タイトル（オプション）
}

// AIアシスタントコンポーネントの定義
export function AiAssistant({ documentId, documentTitle }: AiAssistantProps) {
    const [question, setQuestion] = useState(""); // 質問入力の状態管理
    const { messages, sendQuestion, clearChat, isLoading, error } = useAiAssistant(documentId); // フックから状態と関数を取得
    const scrollAreaRef = useRef<HTMLDivElement>(null); // スクロールエリアの参照を作成

    // 新しいメッセージが追加されたら自動スクロール
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight; // スクロール位置を最下部に設定
        }
    }, [messages]); // メッセージが更新されるたびに実行

    // フォーム送信ハンドラ
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // デフォルトのフォーム送信動作を防止
        if (question.trim() && !isLoading) {
            sendQuestion(question); // 質問を送信
            setQuestion(""); // 入力フィールドをクリア
        }
    };

    return (
        // カードコンポーネントを使用してUIを構築
        <Card className="flex flex-col">
            {/* カードヘッダーにタイトルとドキュメントタイトルを表示 */}
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> {/* タイトル横のアイコン */}
                        AIアシスタント
                    </CardTitle>
                    {documentTitle && ( // ドキュメントタイトルが存在する場合にバッジを表示
                        <Badge variant="outline" className="ml-auto">
                            書類: {documentTitle}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {/* カードのメインコンテンツ */}
            <CardContent className="flex-grow overflow-hidden p-0">
                <ScrollArea className="h-[450px] px-4" ref={scrollAreaRef as any}>
                    {messages.length === 0 ? (
                        // 初回表示時のメッセージ
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                            <Sparkles className="h-10 w-10 mb-2" /> {/* 初回表示用アイコン */}
                            <h3 className="font-medium mb-1">マンション管理について質問できます</h3>
                            <p className="text-sm">
                                例: 「修繕積立金の値上げ方法は？」「管理組合の理事会議事録の保管期間は？」
                            </p>
                        </div>
                    ) : (
                        // メッセージリスト
                        <div className="flex flex-col gap-4 py-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id} // メッセージの一意なIDをキーに設定
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} // ユーザーとAIで配置を切り替え
                                >
                                    <Card
                                        className={`max-w-[90%] rounded-lg p-3 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground" // ユーザーのメッセージスタイル
                                            : "bg-muted" // AIのメッセージスタイル
                                            }`}
                                    >
                                        {message.role === "user" ? (
                                            <div className="whitespace-pre-wrap">{message.content}</div> // ユーザーのメッセージ内容
                                        ) : message.structuredContent ? (
                                            // AIの構造化されたメッセージ内容
                                            <div className="space-y-4">
                                                <h4 className="font-medium">回答要点</h4>
                                                <p className="whitespace-pre-wrap text-sm">
                                                    {message.structuredContent.回答要点}
                                                </p>
                                                {/* 以下、構造化された内容を条件付きで表示 */}
                                                {message.structuredContent.法的・実務的根拠 && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">法的・実務的根拠</h4>
                                                        <p className="text-sm whitespace-pre-wrap">
                                                            {message.structuredContent.法的・実務的根拠}
                                                        </p>
                                                    </div>
                                                )}
                                                {message.structuredContent.実行プラン && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">実行プラン</h4>
                                                        {message.structuredContent.実行プラン.すぐに実行すべきこと && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">すぐに実行すべきこと</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.実行プラン.すぐに実行すべきこと}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {message.structuredContent.実行プラン.中期的に検討すべきこと && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">中期的に検討すべきこと</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.実行プラン.中期的に検討すべきこと}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {message.structuredContent.実行プラン.長期的に準備すべきこと && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">長期的に準備すべきこと</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.実行プラン.長期的に準備すべきこと}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {message.structuredContent.注意点とリスク && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">注意点とリスク</h4>
                                                        {message.structuredContent.注意点とリスク.想定されるトラブルや注意点 && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">想定されるトラブルや注意点</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.注意点とリスク.想定されるトラブルや注意点}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {message.structuredContent.注意点とリスク.法的リスクや責任の所在 && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">法的リスクや責任の所在</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.注意点とリスク.法的リスクや責任の所在}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {message.structuredContent.管理実務上のポイント && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">管理実務上のポイント</h4>
                                                        {message.structuredContent.管理実務上のポイント.書類作成・保管に関するアドバイス && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">書類作成・保管に関するアドバイス</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.管理実務上のポイント.書類作成・保管に関するアドバイス}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {message.structuredContent.管理実務上のポイント.区分所有者への説明方法 && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">区分所有者への説明方法</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.管理実務上のポイント.区分所有者への説明方法}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {message.structuredContent.管理実務上のポイント.意思決定プロセスの進め方 && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">意思決定プロセスの進め方</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.管理実務上のポイント.意思決定プロセスの進め方}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {message.structuredContent.参考事例 && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">参考事例</h4>
                                                        <p className="text-sm">{message.structuredContent.参考事例}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap">{message.content}</div> // AIの通常メッセージ内容
                                        )}
                                    </Card>
                                </div>
                            ))}
                            {isLoading && (
                                // ローディング中の表示
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                                            <span className="text-sm text-muted-foreground ml-1">考え中...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {error && (
                        // エラー発生時のアラート表示
                        <Alert variant="destructive" className="my-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{(error as Error).message}</AlertDescription>
                        </Alert>
                    )}
                </ScrollArea>
            </CardContent>

            {/* カードのフッター部分 */}
            <CardFooter className="border-t p-2">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearChat} // チャット履歴をクリア
                        title="会話をクリア"
                    >
                        <Trash className="h-4 w-4" /> {/* ゴミ箱アイコン */}
                    </Button>
                    <Input
                        placeholder="質問を入力してください..." // 入力フィールドのプレースホルダー
                        value={question} // 入力値をバインド
                        onChange={(e) => setQuestion(e.target.value)} // 入力値の変更をハンドリング
                        disabled={isLoading} // ローディング中は入力を無効化
                        className="flex-grow"
                    />
                    <Button type="submit" size="icon" disabled={!question.trim() || isLoading}>
                        <Send className="h-4 w-4" /> {/* 送信アイコン */}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
