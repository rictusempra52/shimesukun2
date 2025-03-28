"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentUploader } from "@/components/document-uploader"
import { DocumentList } from "@/components/document-list"
import { BuildingList } from "@/components/building-list"
import { StatsCards } from "@/components/stats-cards"
import { SearchBar } from "@/components/search-bar"
import { UserNav } from "@/components/user-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { askDifyBuildingManagementQuestion } from "@/lib/dify"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

/**
 * ダッシュボードページコンポーネント
 * 
 * このコンポーネントはアプリケーションのメイン画面として機能し、
 * 書類一覧、アップロード、検索、AI質問応答、管理機能などの
 * 様々なビューを切り替えて表示します。
 */
export default function DashboardPage() {
  // 検索クエリの状態を管理
  const [searchQuery, setSearchQuery] = useState("")

  // 現在表示中のビューを管理するステート
  // "index": トップページ、"documents": 書類一覧、"upload": アップロード画面など
  const [currentView, setCurrentView] = useState<
    "index" | "documents" | "upload" | "buildings" | "qa" | "users" | "system" | "logs"
  >("index")

  // AI質問応答機能のための状態管理
  const [question, setQuestion] = useState("") // ユーザーの質問文
  const [aiResponse, setAiResponse] = useState<{
    回答要点: string,
    法的実務的根拠: string,
    実行プラン: {
      すぐに実行すべきこと: string,
      中期的に検討すべきこと: string,
      長期的に準備すべきこと: string,
    },
    注意点とリスク: {
      想定されるトラブルや注意点: string,
      法的リスクや責任の所在: string,
    },
    管理実務上のポイント: {
      書類作成保管に関するアドバイス: string,
      区分所有者への説明方法: string,
      意思決定プロセスの進め方: string,
    },
    参考事例: string,
    sources?: string,  // 後方互換性のため
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false) // 読み込み状態
  const [error, setError] = useState<string | null>(null);

  /**
   * AIに質問する処理
   * 
   * ユーザーの質問をDify APIに送信し、回答を取得します。
   * 処理中はローディング状態を表示し、エラーが発生した場合は
   * エラーメッセージをアラートで表示します。
   */
  const handleAskQuestion = async () => {
    // 質問が空の場合は何もしない
    if (!question.trim()) return;

    // 読み込み中状態に設定
    setIsLoading(true);
    setError(null);
    setAiResponse(null); // 既存の回答をクリア

    try {
      // Dify APIを呼び出して回答を取得
      const response = await askDifyBuildingManagementQuestion(question);

      // デバッグ用：レスポンス全体をコンソールに出力
      console.log("APIからの返答:", response);

      // レスポンスがdata配下にある場合とそうでない場合の両方に対応
      const aiResponseData = response.data ? response.data : response;

      // 回答をステートに設定
      setAiResponse(aiResponseData);
      console.log("セットされた回答:", aiResponseData);

    } catch (error) {
      console.error("AIリクエストエラー:", error);
      setError((error as Error).message);
    } finally {
      // 読み込み状態を解除
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー部分 - 常に画面上部に固定表示 */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <h1
            className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={() => setCurrentView("index")}
          >
            書類管理システム
          </h1>
          {/* 右側のナビゲーション - 検索バーとユーザーメニュー */}
          <div className="ml-auto flex items-center space-x-4">
            <SearchBar onSearch={setSearchQuery} />
            <UserNav />
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      {/* <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8"></main> */}
      {/* 統計カード - ドキュメント数やストレージ使用量などの概要 */}
      <StatsCards />

      {/* トップページ表示時のコンテンツ */}
      {currentView === "index" ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">何をしますか？</h2>

          {/* 主要機能のカードグリッド - 3つのカードに */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 書類一覧カード */}
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setCurrentView("documents")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">書類を探す</h3>
                  <p className="text-muted-foreground mt-2">アップロードされた書類を検索・閲覧します</p>
                </div>
              </CardContent>
            </Card>

            {/* 書類アップロードカード */}
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setCurrentView("upload")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">書類をアップロード</h3>
                  <p className="text-muted-foreground mt-2">新しい書類をシステムに登録します</p>
                </div>
              </CardContent>
            </Card>

            {/* AI質問カード */}
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setCurrentView("qa")}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">AIに質問する</h3>
                  <p className="text-muted-foreground mt-2">書類の内容についてAIに質問します</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // インデックス以外のビュー表示時のコンテンツ
        <div className="space-y-4">
          {/* 戻るボタンとページタイトル */}
          <div className="flex items-center">
            <Button variant="ghost" className="mr-2" onClick={() => setCurrentView("index")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              戻る
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {/* 現在のビューに応じたタイトル表示 */}
              {currentView === "documents" && "書類一覧"}
              {currentView === "upload" && "書類アップロード"}
              {currentView === "buildings" && "マンション管理"}
              {currentView === "qa" && "AI質問応答"}
              {currentView === "users" && "ユーザー管理"}
              {currentView === "system" && "システム設定"}
              {currentView === "logs" && "操作ログ"}
            </h2>
          </div>

          {/* 書類一覧ビュー */}
          {currentView === "documents" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>書類検索</CardTitle>
                  <CardDescription>タイトルやOCRで抽出されたテキストから書類を検索できます</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                    {/* 書類一覧コンポーネント表示 */}
                    <DocumentList searchQuery={searchQuery} />
                  </div>
                  <div className="p-4 sm:hidden">
                    <Button variant="outline" className="w-full text-center" onClick={() => { }}>
                      もっと見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 書類アップロードビュー */}
          {currentView === "upload" && (
            <Card>
              <CardHeader>
                <CardTitle>書類アップロード</CardTitle>
                <CardDescription>PDF、JPG、PNG形式の書類をアップロードできます（最大10MB）</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 書類アップローダーコンポーネント */}
                <DocumentUploader />
              </CardContent>
            </Card>
          )}

          {/* マンション一覧ビュー */}
          {currentView === "buildings" && (
            <Card>
              <CardHeader>
                <CardTitle>マンション一覧</CardTitle>
                <CardDescription>登録されているマンションの一覧と書類数を表示します</CardDescription>
              </CardHeader>
              <CardContent>
                {/* マンション一覧コンポーネント */}
                <BuildingList />
              </CardContent>
            </Card>
          )}

          {/* AI質問応答ビュー */}
          {currentView === "qa" && (
            <Card>
              <CardHeader>
                <CardTitle>AI質問応答</CardTitle>
                <CardDescription>アップロードされた書類に基づいて質問に回答します</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 質問入力フォーム */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="例: 大規模修繕の見積もりはいくらですか？"
                      className="flex-1"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        // Enterキーで質問を送信（Shift+Enterは改行）
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleAskQuestion()
                        }
                      }}
                    />
                    {/* 質問送信ボタン */}
                    <Button onClick={handleAskQuestion} disabled={isLoading || !question.trim()}>
                      {isLoading ? (
                        <>
                          <span className="animate-pulse mr-2">...</span>
                          処理中
                        </>
                      ) : (
                        "質問する"
                      )}
                    </Button>
                  </div>

                  {/* AIからの回答表示エリア */}
                  <div className="rounded-lg border p-4 space-y-4">
                    {/* 回答要点セクション */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">回答要点</h3>
                      <div className="p-3 bg-muted rounded-md">
                        {/* ローディング表示 */}
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-pulse h-3 w-3 rounded-full bg-primary"></div>
                            <div className="animate-pulse h-3 w-3 rounded-full bg-primary"></div>
                            <div className="animate-pulse h-3 w-3 rounded-full bg-primary"></div>
                            <p className="text-sm text-muted-foreground">AIが回答を生成しています...</p>
                          </div>
                        ) : aiResponse ? (
                          // AI回答の表示（修正：デバッグ情報を追加）
                          <>
                            <p>{aiResponse.回答要点 || '回答が正しく表示できません。'}</p>
                            {!aiResponse.回答要点 && (
                              <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
                                <p>デバッグ情報: 回答オブジェクトの内容</p>
                                <pre className="overflow-auto max-h-32 text-xs mt-1">
                                  {JSON.stringify(aiResponse, null, 2)}
                                </pre>
                              </div>
                            )}
                          </>
                        ) : (
                          // 初期状態の説明
                          <p>質問を入力すると、AIがアップロードされた書類から回答を生成します。</p>
                        )}
                      </div>
                    </div>

                    {/* 法的・実務的根拠セクション */}
                    {aiResponse && aiResponse.法的実務的根拠 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">法的・実務的根拠</h3>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm">{aiResponse.法的実務的根拠}</p>
                        </div>
                      </div>
                    )}

                    {/* 実行プランセクション */}
                    {aiResponse && aiResponse.実行プラン && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">実行プラン</h3>
                        <div className="p-3 bg-muted rounded-md space-y-3">
                          {aiResponse.実行プラン?.すぐに実行すべきこと && (
                            <div>
                              <h4 className="text-xs font-semibold">すぐに実行すべきこと</h4>
                              <p className="text-sm">{aiResponse.実行プラン.すぐに実行すべきこと}</p>
                            </div>
                          )}
                          {aiResponse.実行プラン?.中期的に検討すべきこと && (
                            <div>
                              <h4 className="text-xs font-semibold">中期的に検討すべきこと</h4>
                              <p className="text-sm">{aiResponse.実行プラン.中期的に検討すべきこと}</p>
                            </div>
                          )}
                          {aiResponse.実行プラン?.長期的に準備すべきこと && (
                            <div>
                              <h4 className="text-xs font-semibold">長期的に準備すべきこと</h4>
                              <p className="text-sm">{aiResponse.実行プラン.長期的に準備すべきこと}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 注意点とリスクセクション */}
                    {aiResponse && aiResponse.注意点とリスク && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">注意点とリスク</h3>
                        <div className="p-3 bg-muted rounded-md space-y-3">
                          {aiResponse.注意点とリスク?.想定されるトラブルや注意点 && (
                            <div>
                              <h4 className="text-xs font-semibold">想定されるトラブルや注意点</h4>
                              <p className="text-sm">{aiResponse.注意点とリスク.想定されるトラブルや注意点}</p>
                            </div>
                          )}
                          {aiResponse.注意点とリスク?.法的リスクや責任の所在 && (
                            <div>
                              <h4 className="text-xs font-semibold">法的リスクや責任の所在</h4>
                              <p className="text-sm">{aiResponse.注意点とリスク.法的リスクや責任の所在}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 管理実務上のポイントセクション */}
                    {aiResponse && aiResponse.管理実務上のポイント && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">管理実務上のポイント</h3>
                        <div className="p-3 bg-muted rounded-md space-y-3">
                          {aiResponse.管理実務上のポイント?.書類作成保管に関するアドバイス && (
                            <div>
                              <h4 className="text-xs font-semibold">書類作成・保管に関するアドバイス</h4>
                              <p className="text-sm">{aiResponse.管理実務上のポイント.書類作成保管に関するアドバイス}</p>
                            </div>
                          )}
                          {aiResponse.管理実務上のポイント?.区分所有者への説明方法 && (
                            <div>
                              <h4 className="text-xs font-semibold">区分所有者への説明方法</h4>
                              <p className="text-sm">{aiResponse.管理実務上のポイント.区分所有者への説明方法}</p>
                            </div>
                          )}
                          {aiResponse.管理実務上のポイント?.意思決定プロセスの進め方 && (
                            <div>
                              <h4 className="text-xs font-semibold">意思決定プロセスの進め方</h4>
                              <p className="text-sm">{aiResponse.管理実務上のポイント.意思決定プロセスの進め方}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 参考事例セクション */}
                    {aiResponse && aiResponse.参考事例 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">参考事例</h3>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm">{aiResponse.参考事例}</p>
                        </div>
                      </div>
                    )}

                    {/* エラーメッセージ表示 */}
                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ユーザー管理ビュー */}
          {currentView === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>ユーザー管理</CardTitle>
                <CardDescription>システムユーザーのアクセス権限を管理します</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  <p>ユーザー管理機能は準備中です</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* システム設定ビュー */}
          {currentView === "system" && (
            <Card>
              <CardHeader>
                <CardTitle>システム設定</CardTitle>
                <CardDescription>システム全体の設定を管理します</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  <p>システム設定機能は準備中です</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作ログビュー */}
          {currentView === "logs" && (
            <Card>
              <CardHeader>
                <CardTitle>操作ログ</CardTitle>
                <CardDescription>システムの利用履歴を確認します</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  <p>操作ログ機能は準備中です</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

