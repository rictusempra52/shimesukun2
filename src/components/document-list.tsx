// document-list.tsx
// このファイルは、ドキュメント一覧を表示するためのコンポーネントを定義しています
// 大まかな構成は、
// - DocumentListコンポーネント: ドキュメント一覧表示の主要機能
// - 検索・フィルター機能: キーワード、マンション名、ファイル形式でのフィルタリング
// - 表示モード: テーブルビューとカードビューの切り替え（レスポンシブ対応）
// - データ取得: サーバーサイドAPIを使用したドキュメントデータの取得
// - エラー処理: データ取得失敗時の表示と再試行機能

"use client"

// - ReactのuseState, useEffect: 状態管理と副作用処理
import { useState, useEffect } from "react"
// - UIコンポーネント: ボタン、入力フィールド、テーブル、カード
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select" // ドロップダウン用コンポーネントをインポート
// - アイコン: 検索アイコン
import { Search } from "lucide-react"
// - ルーター: Next.jsのルーティング機能
import { useRouter } from "next/navigation"
// - Document: ドキュメントの型定義
import { Document } from "@/types/document"
import { getKnowledgeBasesFromClient } from "@/lib/dify/browser" // ナレッジベース取得関数をインポート

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
 * - 表示モード: テーブルビューとカードビューの切り替え
 * - レスポンシブデザイン: スマートフォンではカードビュー、PCではテーブルビュー
 * - データ取得: サーバーサイドAPIを使用してドキュメントデータを取得
 * - エラー処理: データ取得失敗時の表示と再試行機能
 * @param searchQuery: 初期検索クエリ
 * @param initialDocuments: 初期ドキュメントリスト
 */
export function DocumentList({ searchQuery = "", initialDocuments = [] }: DocumentListProps) {
  const router = useRouter();
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<{ id: string; name: string }[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 640 ? "card" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      try {
        const result = await getKnowledgeBasesFromClient();
        setKnowledgeBases(result.data || []);
      } catch (err) {
        console.error("Error fetching knowledge bases:", err);
      }
    };
    fetchKnowledgeBases();
  }, []);

  useEffect(() => {
    if (selectedKnowledgeBase) {
      fetchAllDocuments();
    }
  }, [selectedKnowledgeBase]);

  const fetchAllDocuments = async () => {
    if (!selectedKnowledgeBase) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching all documents for dataset:", selectedKnowledgeBase);

      const response = await fetch(`/api/knowledge/${selectedKnowledgeBase}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "*", // ワイルドカードクエリで全ドキュメント取得を試みる
          top_k: 50, // より多くのドキュメントを取得
          search_method: "keyword_search", // キーワード検索を使用
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData.error || "ドキュメント一覧の取得に失敗しました");
      }

      const result = await response.json();
      console.log("All documents fetched successfully:", result);

      // APIレスポンス構造に合わせてデータを取得
      // Dify APIはrecords配列でデータを返す
      if (result.records && Array.isArray(result.records)) {
        console.log("Documents found in records array:", result.records.length);

        // ドキュメント型に変換
        const formattedDocs = result.records.map((item: any) => ({
          id: item.document_id || item.id || `doc-${Math.random()}`,
          title: item.title || item.document_name || "無題ドキュメント",
          building: item.metadata?.building || item.building || "未分類",
          tags: Array.isArray(item.tags) ? item.tags : [],
          uploadedAt: item.uploaded_at || item.created_at || new Date().toISOString(),
        }));

        setDocuments(formattedDocs);
      } else if (result.data && Array.isArray(result.data)) {
        setDocuments(result.data);
      } else {
        console.warn("Unexpected response format:", result);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error("Error fetching all documents:", err);
      setError(err.message || "ドキュメント一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    };
  };

  const fetchDocuments = async () => {
    if (!selectedKnowledgeBase) {
      setError("ナレッジベースを選択してください");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const searchQuery = localSearchQuery.trim() || "*";

      console.log("Fetching documents with query:", searchQuery);
      const response = await fetch(`/api/knowledge/${selectedKnowledgeBase}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          top_k: 10,
          search_method: "hybrid_search",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData.error || "検索に失敗しました");
      }
      const result = await response.json();
      console.log("Documents fetched successfully:", result);

      // 全件取得と同じ形式でレスポンスを処理
      if (result.records && Array.isArray(result.records)) {
        console.log("Search found documents in records array:", result.records.length);

        // ドキュメント型に変換
        const formattedDocs = result.records.map((item: any) => ({
          id: item.document_id || item.id || `doc-${Math.random()}`,
          title: item.title || item.document_name || "無題ドキュメント",
          building: item.metadata?.building || item.building || "未分類",
          tags: Array.isArray(item.tags) ? item.tags : [],
          uploadedAt: item.uploaded_at || item.created_at || new Date().toISOString(),
        }));

        setDocuments(formattedDocs);
      } else if (result.data && Array.isArray(result.data)) {
        setDocuments(result.data);
      } else {
        console.warn("Unexpected search response format:", result);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError(err.message || "ドキュメントの取得に失敗しました");
    } finally {
      setIsLoading(false);
    };
  };

  const handleSearch = () => {
    if (selectedKnowledgeBase) {
      fetchDocuments();
    } else {
      setError("ナレッジベースを選択してください");
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">書類データを読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchDocuments}>再試行</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="w-full">
          <label className="text-sm font-medium mb-2 block">データセット選択</label>
          <Select
            value={selectedKnowledgeBase || ""}
            onValueChange={(value) => setSelectedKnowledgeBase(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="データセットを選択してください" />
            </SelectTrigger>
            <SelectContent>
              {knowledgeBases.map((kb) => (
                <SelectItem key={kb.id} value={kb.id}>
                  {kb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedKnowledgeBase && (
            <p className="text-xs text-muted-foreground mt-1">
              選択されたデータセットのドキュメントを表示しています
            </p>
          )}
        </div>
        <div className="flex-1 relative">
          <Input
            placeholder="キーワードで検索..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <Button onClick={handleSearch} className="mt-2">検索</Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.building}</TableCell>
                    <TableCell>{doc.tags.join(", ")}</TableCell>
                    <TableCell>{doc.uploadedAt}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    検索条件に一致する書類がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent>
                <h4>{doc.title}</h4>
                <p>{doc.building}</p>
                <p>{doc.tags.join(", ")}</p>
                <p>{doc.uploadedAt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
