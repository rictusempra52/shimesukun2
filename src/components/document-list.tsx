// document-list.tsx
// このファイルは、ドキュメント一覧を表示するためのコンポーネントを定義しています
// 大まかな構成は、
// - DocumentListコンポーネント: ドキュメント一覧表示の主要機能
// - 検索・フィルター機能: キーワード、マンション名、ファイル形式でのフィルタリング
// - 表示モード: テーブルビューとカードビューの切り替え（レスポンシブ対応）
// - データ取得: SWRを使用したAPIからのドキュメントデータの取得
// - エラー処理: データ取得失敗時の表示と再試行機能
// - ドキュメント詳細表示: 各ドキュメントの詳細ページへのナビゲーション

"use client"

// - ReactのuseState, useEffect, useRef: 状態管理と副作用処理
import { useState, useEffect, useRef } from "react"
// - UIコンポーネント: ボタン、入力フィールド、セレクトボックス、テーブル、バッジ、カード
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
// - アイコン: ファイルのアイコン、ダウンロードの…、目、検索、矢印　
import { FileText, Download, Eye, Search, ChevronRight } from "lucide-react"
// - ルーター: Next.jsのルーティング機能
import { useRouter } from "next/navigation"
// - Document: ドキュメントの型定義
import { Document } from "@/types/document"
// - useSWR: データ取得ライブラリ
import useSWR from 'swr'
// - useApiFetcher: APIリクエストを行うためのカスタムフック
import { useApiFetcher } from "@/lib/api-fetcher"

/** DocumentListコンポーネントのプロップ定義
 * @property searchQuery - 初期検索クエリ（URLクエリパラメータなど）
 * @property initialDocuments - 初期表示用のドキュメントリスト
 */
interface DocumentListProps {
  searchQuery?: string
  initialDocuments?: Document[]
}

/** ドキュメント一覧を表示するコンポーネント
 * - 検索機能: タイトル、マンション名、タグでフィルタリング
 * - フィルタリング: マンション名、ファイル形式でのフィルタリング
 * - 表示モード: テーブルビューとカードビューの切り替え
 * - レスポンシブデザイン: スマートフォンではカードビュー、PCではテーブルビュー
 * - データ取得: SWRを使用してAPIからドキュメントデータを取得
 * - エラー処理: データ取得失敗時の表示と再試行機能
 * - ドキュメント詳細表示: 各ドキュメントの詳細ページへのナビゲーション
 * @param searchQuery: 初期検索クエリ
 * @param initialDocuments: 初期ドキュメントリスト
 */
export function DocumentList(
  { searchQuery = "", initialDocuments = [] }: DocumentListProps) {
  // Next.jsのルーターを使用してページ遷移を行う（書類詳細ページへの遷移に使用）
  const router = useRouter()

  // マンション名でフィルタリングするための状態変数と更新関数
  const [buildingFilter, setBuildingFilter] = useState<string>("")

  // ファイル形式（PDF/JPG/PNG）でフィルタリングするための状態変数と更新関数
  const [typeFilter, setTypeFilter] = useState<string>("")

  // 検索クエリを保持するための状態変数（propsで渡されたsearchQueryを初期値として使用）
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery)

  // 表示モード（テーブルビュー/カードビュー）を切り替えるための状態変数
  // デフォルトはテーブルビュー、レスポンシブ対応のためにuseEffectで動的に変更される
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // APIリクエストを行うためのカスタムフック関数を取得
  const fetcher = useApiFetcher()

  // useSWRを使用してドキュメントデータをフェッチ
  // 戻り値: data（取得データ）、error（エラー情報）、isLoading（読み込み中かどうか）
  const { data, error, isLoading } = useSWR<{ documents: Document[] }>(
    // APIエンドポイントURL
    '/api/documents',
    // フェッチャー関数
    fetcher,
    {
      // 初期データがある場合は使用し、即座にUIをレンダリング
      fallbackData: initialDocuments.length
        ? { documents: initialDocuments }
        : undefined,
      // ページにフォーカスが当たった時に再検証する
      revalidateOnFocus: true,
      // ネットワーク接続が回復した時に再検証する
      revalidateOnReconnect: true,
      // エラーハンドリング（コンソールにエラー内容を出力）
      onError: (err) => {
        console.error('データ取得エラー:', err);
      }
    }
  );

  // 安全にコンポーネントがマウントされているかを追跡
  const isMounted = useRef(true);

  // コンポーネントのアンマウント時に変数を設定
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // コンポーネントがマウントされている場合のみ状態を更新
      if (isMounted.current) {
        setViewMode(window.innerWidth < 640 ? "card" : "table");
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    // クリーンアップ関数を追加
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 安全な早期リターン
  if (isLoading && !initialDocuments.length) {
    return <div className="py-8 text-center">書類データを読み込み中...</div>;
  }

  if (error) {
    console.error('データ取得エラー:', error);
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">データの読み込みに失敗しました。</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
        <Button
          variant="secondary"
          className="mt-4 ml-2"
          onClick={() => {
            // モックデータに切り替え
            localStorage.setItem("dataSource", "mock");
            console.log("INFO: Firebaseが空/接続失敗のため、モックデータに切り替えました。");
            window.location.reload();
          }}
        >
          モックデータを使用
        </Button>
      </div>
    );
  }

  // 安全なデータ取得
  const documents = data?.documents || [];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      localSearchQuery === "" ||
      doc.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(localSearchQuery.toLowerCase()))

    const matchesBuilding = buildingFilter === "" || doc.building === buildingFilter

    const matchesType = typeFilter === "" || doc.type === typeFilter

    return matchesSearch && matchesBuilding && matchesType
  })

  const navigateToDocumentDetails = (docId: string) => {
    router.push(`/documents/${docId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="キーワードで検索..."
            value={localSearchQuery || searchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="マンション" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="グランドパレス東京">グランドパレス東京</SelectItem>
            <SelectItem value="サンシャインマンション">サンシャインマンション</SelectItem>
            <SelectItem value="パークハイツ横浜">パークハイツ横浜</SelectItem>
            <SelectItem value="リバーサイドタワー大阪">リバーサイドタワー大阪</SelectItem>
            <SelectItem value="グリーンヒルズ札幌">グリーンヒルズ札幌</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="ファイル形式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="JPG">JPG</SelectItem>
            <SelectItem value="PNG">PNG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>マンション</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead>アップロード日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer" onClick={() => navigateToDocumentDetails(doc.id)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.title}
                      </div>
                    </TableCell>
                    <TableCell>{doc.building}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{doc.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToDocumentDetails(doc.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">表示</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">ダウンロード</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    検索条件に一致する書類がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="overflow-hidden cursor-pointer"
                onClick={() => navigateToDocumentDetails(doc.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">{doc.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.building}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">検索条件に一致する書類がありません</div>
          )}
        </div>
      )}
    </div>
  )
}
