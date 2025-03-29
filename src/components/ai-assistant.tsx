"use client"; // Next.jsのクライアントコンポーネントであることを宣言

// 必要なReactフックとコンポーネントをインポート
import { useState, useRef, useEffect } from "react"; // Reactの基本フック
import { Button } from "@/components/ui/button"; // ボタンコンポーネント
import { Input } from "@/components/ui/input"; // 入力フィールドコンポーネント
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // カードUIコンポーネント
import { ScrollArea } from "@/components/ui/scroll-area"; // スクロール可能なエリアコンポーネント
import { Badge } from "@/components/ui/badge"; // バッジコンポーネント
import { AlertCircle, Send, Sparkles, Trash } from "lucide-react"; // アイコンコンポーネント
import { Alert, AlertDescription } from "@/components/ui/alert"; // アラートコンポーネント
import { useAiAssistant, ChatMessage } from "@/hooks/useAiAssistant"; // AIアシスタントのカスタムフック

/**
 * AIアシスタントコンポーネントのプロパティ定義
 * @property {string} [documentId] - 対象文書のID（オプション）
 * @property {string} [documentTitle] - 対象文書のタイトル（オプション）
 */
interface AiAssistantProps {
    documentId?: string; // 特定の文書に関連付ける場合の文書ID
    documentTitle?: string; // 文書のタイトル（UIに表示される）
}

/**
 * AIアシスタントコンポーネント
 * 
 * ユーザーがAIに質問でき、構造化された回答を表示するコンポーネント。
 * 文書コンテキスト内で使用する場合は、文書IDとタイトルを渡すことができます。
 * 
 * @param {AiAssistantProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} AIアシスタントのUI
 */
export function AiAssistant({ documentId, documentTitle }: AiAssistantProps) {
    // 質問入力フィールドの状態管理
    const [question, setQuestion] = useState("");

    // AIアシスタントのカスタムフックを使用してチャット機能を実装
    const { messages, sendQuestion, clearChat, isLoading, error } = useAiAssistant(documentId);

    // スクロールエリアへの参照を作成（新しいメッセージが来たときに自動スクロールするため）
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    /**
     * 新しいメッセージが追加されたら自動スクロールする効果
     * messagesが変更されるたびに発火し、スクロールエリアを一番下までスクロールします
     */
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]); // messagesが変更されたときだけ実行

    /**
     * フォーム送信時の処理
     * 
     * ユーザーが質問を送信したときに呼び出される関数。
     * 質問が空でなく、かつ読み込み中でない場合のみ質問を送信します。
     * 
     * @param {React.FormEvent} e - フォーム送信イベント
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // フォームのデフォルト送信を防止
        if (question.trim() && !isLoading) { // 質問が空白でなく、読み込み中でない場合
            sendQuestion(question); // 質問を送信
            setQuestion(""); // 入力フィールドをクリア
        }
    };

    return (
        // カードコンテナ - チャットUIの外枠
        <Card className="flex flex-col h-[600px]">
            {/* ヘッダー部分 - タイトルと関連文書情報を表示 */}
            <CardHeader>
                <div className="flex items-center justify-between">
                    {/* タイトルとアイコン */}
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> {/* キラキラアイコン */}
                        AIアシスタント
                    </CardTitle>
                    {/* 文書タイトルがある場合、バッジとして表示 */}
                    {documentTitle && (
                        <Badge variant="outline" className="ml-auto">
                            書類: {documentTitle}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {/* メインコンテンツ - チャットメッセージを表示するエリア */}
            <CardContent className="flex-grow overflow-hidden p-0">
                {/* スクロール可能なメッセージエリア */}
                <ScrollArea className="h-[450px] px-4" ref={scrollAreaRef as any}>
                    {/* メッセージがない場合の初期表示 */}
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                            <Sparkles className="h-10 w-10 mb-2" /> {/* 大きめのキラキラアイコン */}
                            <h3 className="font-medium mb-1">マンション管理について質問できます</h3>
                            <p className="text-sm">
                                例: 「修繕積立金の値上げ方法は？」「管理組合の理事会議事録の保管期間は？」
                            </p>
                        </div>
                    ) : (
                        // メッセージがある場合、メッセージリストを表示
                        <div className="flex flex-col gap-4 py-4">
                            {/* 各メッセージをマッピングして表示 */}
                            {messages.map((message) => (
                                <div
                                    key={message.id} // ユニークなIDをキーとして使用
                                    // ユーザーのメッセージは右寄せ、AIの回答は左寄せ
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {/* メッセージのカード表示 */}
                                    <Card
                                        className={`max-w-[90%] rounded-lg p-3 ${message.role === "user"
                                                ? "bg-primary text-primary-foreground" // ユーザーメッセージのスタイル
                                                : "bg-muted" // AIメッセージのスタイル
                                            }`}
                                    >
                                        {/* ユーザーのメッセージの場合、単純にテキスト表示 */}
                                        {message.role === "user" ? (
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                        ) : message.structuredContent ? (
                                            // AIの回答で構造化データがある場合、セクションごとに表示
                                            <div className="space-y-4">
                                                {/* 回答要点セクション - 常に表示 */}
                                                <h4 className="font-medium">回答要点</h4>
                                                <p className="whitespace-pre-wrap text-sm">
                                                    {message.structuredContent.回答要点}
                                                </p>

                                                {/* 法的・実務的根拠セクション - あれば表示 */}
                                                {message.structuredContent.法的・実務的根拠 && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">法的・実務的根拠</h4>
                                                        <p className="text-sm whitespace-pre-wrap">
                                                            {message.structuredContent.法的・実務的根拠}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* 実行プランセクション - あれば表示 */}
                                                {message.structuredContent.実行プラン && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">実行プラン</h4>
                                                        {/* すぐに実行すべきことの項目 */}
                                                        {message.structuredContent.実行プラン.すぐに実行すべきこと && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">すぐに実行すべきこと</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.実行プラン.すぐに実行すべきこと}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {/* 中期的に検討すべきことの項目 */}
                                                        {message.structuredContent.実行プラン.中期的に検討すべきこと && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">中期的に検討すべきこと</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.実行プラン.中期的に検討すべきこと}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {/* 長期的に準備すべきことの項目 */}
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

                                                {/* 注意点とリスクセクション - あれば表示 */}
                                                {message.structuredContent.注意点とリスク && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">注意点とリスク</h4>
                                                        {/* 想定されるトラブルや注意点の項目 */}
                                                        {message.structuredContent.注意点とリスク.想定されるトラブルや注意点 && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">想定されるトラブルや注意点</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.注意点とリスク.想定されるトラブルや注意点}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {/* 法的リスクや責任の所在の項目 */}
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

                                                {/* 管理実務上のポイントセクション - あれば表示 */}
                                                {message.structuredContent.管理実務上のポイント && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">管理実務上のポイント</h4>
                                                        {/* 書類作成・保管に関するアドバイスの項目 */}
                                                        {message.structuredContent.管理実務上のポイント.書類作成・保管に関するアドバイス && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">書類作成・保管に関するアドバイス</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.管理実務上のポイント.書類作成・保管に関するアドバイス}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {/* 区分所有者への説明方法の項目 */}
                                                        {message.structuredContent.管理実務上のポイント.区分所有者への説明方法 && (
                                                            <div className="mt-2">
                                                                <h5 className="text-xs font-medium">区分所有者への説明方法</h5>
                                                                <p className="text-sm">
                                                                    {message.structuredContent.管理実務上のポイント.区分所有者への説明方法}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {/* 意思決定プロセスの進め方の項目 */}
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

                                                {/* 参考事例セクション - あれば表示 */}
                                                {message.structuredContent.参考事例 && (
                                                    <div className="mt-3">
                                                        <h4 className="font-medium text-sm border-t pt-2">参考事例</h4>
                                                        <p className="text-sm">{message.structuredContent.参考事例}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // 構造化データがない場合は通常のテキスト表示
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                        )}
                                    </Card>
                                </div>
                            ))}

                            {/* 読み込み中の場合、ローディングインジケータを表示 */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                                        <div className="flex items-center gap-2">
                                            {/* 3つのドットでアニメーションを表現 */}
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

                    {/* エラーがある場合、アラートを表示 */}
                    {error && (
                        <Alert variant="destructive" className="my-4">
                            <AlertCircle className="h-4 w-4" /> {/* 警告アイコン */}
                            <AlertDescription>{(error as Error).message}</AlertDescription>
                        </Alert>
                    )}
                </ScrollArea>
            </CardContent>

            {/* フッター部分 - 質問入力フォーム */}
            <CardFooter className="border-t p-2">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    {/* 会話クリアボタン */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearChat}
                        title="会話をクリア"
                    >
                        <Trash className="h-4 w-4" /> {/* ゴミ箱アイコン */}
                    </Button>

                    {/* 質問入力フィールド */}
                    <Input
                        placeholder="質問を入力してください..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isLoading} // 読み込み中は入力を無効化
                        className="flex-grow"
                    />

                    {/* 質問送信ボタン */}
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!question.trim() || isLoading} // 質問が空または読み込み中は送信不可
                    >
                        <Send className="h-4 w-4" /> {/* 送信アイコン */}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
