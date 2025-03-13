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
    answer: string       // AIの回答
    sources: string      // 回答の根拠となる書類情報
    relatedInfo: string  // 関連情報
    examples: string     // 他マンションの事例
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false) // 読み込み状態

  /**
   * AIに質問する処理
   * 実際の実装ではAPIを呼び出しますが、現在はモックデータでシミュレーション
   */
  const handleAskQuestion = () => {
    // 質問が空の場合は何もしない
    if (!question.trim()) return

    // 読み込み中状態に設定
    setIsLoading(true)

    // モックデータでのシミュレーション（実際はAPIコール）
    setTimeout(() => {
      setAiResponse({
        // 質問に対する回答
        answer: `「${question}」についての回答です。大規模修繕の見積もりは一般的に建物の規模、築年数、修繕内容によって大きく異なります。グランドパレス東京の場合、直近の見積もりでは総額約8,500万円となっています。内訳は外壁塗装が約3,200万円、防水工事が約2,100万円、その他設備更新が約3,200万円です。`,
        // 回答の根拠となる書類
        sources: "「管理組合総会議事録」(2023-12-15), 「修繕工事見積書」(2023-12-10)",
        // 追加の関連情報
        relatedInfo: "大規模修繕は通常10〜15年ごとに実施され、修繕積立金から支出されます。現在の修繕積立金の残高は約1億2,000万円で、今回の修繕後も十分な資金が確保されています。",
        // 他マンションでの類似事例
        examples: "サンシャインマンションでは同規模の修繕工事を昨年実施し、総額7,800万円でした。パークハイツ横浜では外壁塗装のみを先行して実施し、約2,800万円の費用でした。",
      })
      setIsLoading(false)
    }, 1500)
  }

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
      <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8">
        {/* 統計カード - ドキュメント数やストレージ使用量などの概要 */}
        <StatsCards />

        {/* トップページ表示時のコンテンツ */}
        {currentView === "index" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">何をしますか？</h2>

            {/* 管理者用のページを下部に配置し、通常のカードは3つに変更 */}
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

            {/* 管理者用セクション - 下部に配置して目立たなくする */}
            <div className="mt-12 border-t pt-6">
              <div className="flex items-center mb-4">
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
                  className="h-4 w-4 mr-2 text-muted-foreground"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <h3 className="text-sm font-medium text-muted-foreground">管理者用設定</h3>
              </div>

              {/* 管理者用カードグリッド */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* マンション管理カード */}
                <Card
                  className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed border-muted"
                  onClick={() => setCurrentView("buildings")}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-muted p-2 rounded">
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
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
                        <path d="M9 2v18" />
                        <path d="M14 8h.01" />
                        <path d="M14 12h.01" />
                        <path d="M14 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">マンション管理</h3>
                      <p className="text-xs text-muted-foreground">マンション情報の設定</p>
                    </div>
                  </CardContent>
                </Card>

                {/* ユーザー管理カード */}
                <Card
                  className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed border-muted"
                  onClick={() => setCurrentView("users")}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-muted p-2 rounded">
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
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">ユーザー管理</h3>
                      <p className="text-xs text-muted-foreground">アクセス権限の設定</p>
                    </div>
                  </CardContent>
                </Card>

                {/* システム設定カード */}
                <Card
                  className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed border-muted"
                  onClick={() => setCurrentView("system")}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-muted p-2 rounded">
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
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">システム設定</h3>
                      <p className="text-xs text-muted-foreground">システム全体の設定</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 操作ログカード */}
                <Card
                  className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed border-muted"
                  onClick={() => setCurrentView("logs")}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-muted p-2 rounded">
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
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 2v8" />
                        <path d="m4.93 10.93 1.41 1.41" />
                        <path d="M2 18h2" />
                        <path d="M20 18h2" />
                        <path d="m19.07 10.93-1.41 1.41" />
                        <path d="M22 22H2" />
                        <path d="m16 6-4 4-4-4" />
                        <path d="M16 18a4 4 0 0 0-8 0" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">操作ログ</h3>
                      <p className="text-xs text-muted-foreground">システム利用履歴</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                      {/* 回答セクション */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">回答</h3>
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
                            // AI回答の表示
                            <p>{aiResponse.answer}</p>
                          ) : (
                            // 初期状態の説明
                            <p>質問を入力すると、AIがアップロードされた書類から回答を生成します。</p>
                          )}
                        </div>
                      </div>

                      {/* 根拠箇所セクション */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">根拠箇所</h3>
                        <div className="p-3 bg-muted rounded-md">
                          {/* 回答の根拠となる書類へのリンク表示 */}
                          {aiResponse ? (
                            <p className="text-sm">
                              参照資料:{" "}
                              {aiResponse.sources.includes("管理組合総会議事録") && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm font-medium text-blue-600 hover:underline"
                                  onClick={() => {
                                    setCurrentView("documents")
                                    setTimeout(() => {
                                      window.location.href = "/documents/1"
                                    }, 100)
                                  }}
                                >
                                  「管理組合総会議事録」
                                </Button>
                              )}
                              {aiResponse.sources.includes("管理組合総会議事録") &&
                                aiResponse.sources.includes("修繕工事見積書") &&
                                ", "}
                              {aiResponse.sources.includes("修繕工事見積書") && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm font-medium text-blue-600 hover:underline"
                                  onClick={() => {
                                    setCurrentView("documents")
                                    setTimeout(() => {
                                      window.location.href = "/documents/2"
                                    }, 100)
                                  }}
                                >
                                  「修繕工事見積書」
                                </Button>
                              )}
                              {aiResponse.sources.includes("消防設備点検報告書") && (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm font-medium text-blue-600 hover:underline"
                                  onClick={() => {
                                    setCurrentView("documents")
                                    setTimeout(() => {
                                      window.location.href = "/documents/3"
                                    }, 100)
                                  }}
                                >
                                  「消防設備点検報告書」
                                </Button>
                              )}
                              {aiResponse.sources.includes("(2023-12-15)") && " (2023-12-15)"}
                              {aiResponse.sources.includes("(2023-12-10)") && " (2023-12-10)"}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              回答の根拠となる書類の該当箇所が表示されます。
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 関連情報セクション */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">関連情報</h3>
                        <div className="p-3 bg-muted rounded-md">
                          {aiResponse ? (
                            <p className="text-sm">{aiResponse.relatedInfo}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              質問に関連する可能性のある追加情報が表示されます。
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 他マンション事例セクション */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">他マンション事例</h3>
                        <div className="p-3 bg-muted rounded-md">
                          {aiResponse ? (
                            <p className="text-sm">{aiResponse.examples}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              類似の状況における他のマンションの事例が表示されます。
                            </p>
                          )}
                        </div>
                      </div>
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
      </main>
    </div>
  )
}

