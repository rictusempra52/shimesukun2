"use client"

/**
 * DocumentViewer コンポーネント
 * 
 * このコンポーネントは書類の詳細表示を担当し、以下の機能を提供します：
 * - 書類のメタデータ表示（タイトル、タグ、説明など）
 * - プレビュー表示
 * - 詳細情報の表示
 * - 関連書類へのリンク
 * 
 * Next.jsのApp Routerを使用し、SSRとCSRのハイブリッドアプローチを取っています。
 * initialDocumentがある場合はサーバーサイドでのデータ取得結果を使用し、
 * ない場合はクライアントサイドでデータを取得します。
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Download, Eye, ChevronLeft, Building2, Calendar, User, FileType, Tag, Clock } from "lucide-react"
import { documentsData } from "@/lib/document-data" // 共通ライブラリからのインポート

/**
 * DocumentViewerコンポーネントのプロパティ
 * 
 * @property documentId - 表示する書類のID（URL パラメータから取得）
 * @property initialDocument - サーバーサイドで事前に取得した書類データ。nullの場合はクライアントサイドでデータを取得
 */
interface DocumentViewerProps {
    documentId: string
    initialDocument: (typeof documentsData)[0] | null
}

export function DocumentViewer({ documentId, initialDocument }: DocumentViewerProps) {
    // Nextルーターの初期化（ページ遷移用）
    const router = useRouter()

    // 書類データの状態管理
    const [document, setDocument] = useState<(typeof documentsData)[0] | null>(initialDocument)

    // ローディング状態の管理（初期データがない場合はローディング状態から開始）
    const [loading, setLoading] = useState(!initialDocument)

    /**
     * 初期データがない場合、クライアントサイドでデータを取得する
     * サーバーサイドレンダリングでデータが取得できなかった場合のフォールバック
     */
    useEffect(() => {
        if (!initialDocument) {
            // documentIdを数値に変換して書類データを検索
            const docId = Number.parseInt(documentId)
            const foundDoc = documentsData.find((doc) => doc.id === docId)

            if (foundDoc) {
                setDocument(foundDoc)
            }

            // ローディング完了を設定
            setLoading(false)
        }
    }, [documentId, initialDocument])

    /**
     * 指定されたIDの関連書類の完全なデータを取得する
     * 
     * @param id - 取得したい関連書類のID
     * @returns 完全な書類データ、または見つからない場合はundefined
     */
    const getRelatedDocument = (id: number) => {
        return documentsData.find((doc) => doc.id === id)
    }

    /**
     * 前のページに戻る
     * ブラウザの履歴を使って一つ前のページに遷移
     */
    const goBack = () => {
        router.back()
    }

    /**
     * 別の書類ページに移動する
     * 
     * @param id - 移動先の書類ID
     */
    const navigateToDocument = (id: number) => {
        router.push(`/documents/${id}`)
    }

    // ローディング中の表示
    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center items-center h-64">
                    {/* アニメーション付きのローディングプレースホルダー */}
                    <div className="animate-pulse text-center">
                        <div className="h-8 w-64 bg-muted rounded mb-4 mx-auto"></div>
                        <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
                    </div>
                </div>
            </div>
        )
    }

    // 書類が見つからない場合の表示
    if (!document) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Button variant="ghost" onClick={goBack} className="mb-4">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    戻る
                </Button>
                <div className="text-center py-12">
                    <h1 className="text-xl font-bold mb-2">書類が見つかりません</h1>
                    <p className="text-muted-foreground">指定された書類は存在しないか、アクセス権限がありません。</p>
                    <Button variant="outline" onClick={goBack} className="mt-4">
                        書類一覧に戻る
                    </Button>
                </div>
            </div>
        )
    }

    // メインの書類ビューア表示
    return (
        <div className="container mx-auto py-8 px-4">
            {/* 戻るボタン */}
            <Button variant="ghost" onClick={goBack} className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" />
                書類一覧に戻る
            </Button>

            {/* 書類のヘッダー情報（タイトル、タグ、説明） */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
                <div className="flex flex-wrap gap-1 mb-2">
                    {document.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <p className="text-muted-foreground">{document.description}</p>
            </div>

            {/* タブ切り替え式のコンテンツ表示 */}
            <Tabs defaultValue="preview" className="mt-6">
                {/* タブナビゲーション */}
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">プレビュー</TabsTrigger>
                    <TabsTrigger value="details">詳細情報</TabsTrigger>
                    <TabsTrigger value="related">関連書類</TabsTrigger>
                </TabsList>

                {/* タブコンテンツ: プレビュー */}
                <TabsContent value="preview" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center">
                                {/* 書類のプレビュー画像 */}
                                <img
                                    src={document.previewUrl || "/placeholder.svg"}
                                    alt={document.title}
                                    className="max-w-full h-auto object-contain rounded border bg-white"
                                />
                                <div className="text-center mt-4 text-sm text-muted-foreground">
                                    <p>
                                        プレビュー: {document.title} (1/{document.pages}ページ)
                                    </p>
                                </div>
                                {/* アクションボタン */}
                                <div className="flex gap-2 mt-6">
                                    <Button variant="outline">
                                        <Eye className="h-4 w-4 mr-2" />
                                        PDFで開く
                                    </Button>
                                    <Button>
                                        <Download className="h-4 w-4 mr-2" />
                                        ダウンロード
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* タブコンテンツ: 詳細情報 */}
                <TabsContent value="details" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            {/* 2カラムレイアウト（モバイルでは1カラム） */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 左カラム: マンション情報、日付、アップロードユーザー */}
                                <div className="space-y-4">
                                    {/* マンション情報 */}
                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium">マンション</h3>
                                            <p className="text-sm">{document.building}</p>
                                        </div>
                                    </div>

                                    {/* アップロード日 */}
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium">アップロード日</h3>
                                            <p className="text-sm">{document.uploadedAt}</p>
                                        </div>
                                    </div>

                                    {/* アップロードユーザー情報 */}
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium">アップロードユーザー</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={document.uploadedBy.avatar} alt={document.uploadedBy.name} />
                                                    <AvatarFallback>{document.uploadedBy.initials}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{document.uploadedBy.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 右カラム: ファイル情報、タグ */}
                                <div className="space-y-4">
                                    {/* ファイル情報 */}
                                    <div className="flex items-start gap-3">
                                        <FileType className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium">ファイル情報</h3>
                                            <p className="text-sm">形式: {document.type}</p>
                                            <p className="text-sm">サイズ: {document.fileSize}</p>
                                            <p className="text-sm">ページ数: {document.pages}ページ</p>
                                        </div>
                                    </div>

                                    {/* タグ情報 */}
                                    <div className="flex items-start gap-3">
                                        <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium">タグ</h3>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {document.tags.map((tag, i) => (
                                                    <Badge key={i} variant="outline">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 説明文セクション */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-sm font-medium mb-2">説明</h3>
                                <p className="text-sm">{document.description}</p>
                            </div>

                            {/* フッター: 最終更新とアクションボタン */}
                            <div className="mt-6 pt-6 border-t flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>最終更新: {document.uploadedAt}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline">
                                        <Eye className="h-4 w-4 mr-2" />
                                        PDFで開く
                                    </Button>
                                    <Button>
                                        <Download className="h-4 w-4 mr-2" />
                                        ダウンロード
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* タブコンテンツ: 関連書類 */}
                <TabsContent value="related" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            {/* 関連書類がある場合のリスト表示 */}
                            {document.relatedDocuments.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">関連書類</h3>
                                    {/* 関連書類のマッピング */}
                                    {document.relatedDocuments.map((relDoc) => {
                                        // 関連書類の完全な情報を取得
                                        const fullDoc = getRelatedDocument(relDoc.id)
                                        if (!fullDoc) return null

                                        return (
                                            <Card
                                                key={relDoc.id}
                                                className="overflow-hidden cursor-pointer"
                                                onClick={() => navigateToDocument(relDoc.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        {/* 関連書類の基本情報 */}
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <h4 className="font-medium text-sm">{relDoc.title}</h4>
                                                                <p className="text-xs text-muted-foreground">{fullDoc.building}</p>
                                                            </div>
                                                        </div>
                                                        {/* 関連書類のメタデータと移動アイコン */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xs text-muted-foreground">{fullDoc.uploadedAt}</div>
                                                            <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : (
                                // 関連書類がない場合のメッセージ
                                <div className="text-center py-8 text-muted-foreground">関連書類はありません</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
