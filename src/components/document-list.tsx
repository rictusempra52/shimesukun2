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
// - UIコンポーネント
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
// - アイコン
import { ChevronDown, ChevronRight, Download, Eye, FileIcon, Search } from "lucide-react"
// - ルーター
import { useRouter } from "next/navigation"
// - 型定義
import { Document } from "@/types/document"
import { getKnowledgeBasesFromClient } from "@/lib/dify/browser" // ナレッジベース取得関数
import { Badge } from "@/components/ui/badge"

/** DocumentListコンポーネントのプロップ定義 */
interface DocumentListProps {
  searchQuery?: string
  initialDocuments?: Document[]
}

interface DocumentGroup {
  id: string;
  title: string;
  building: string;
  tags: string[];
  chunks?: {
    id: string;
    content: string;
    score: number | null;
    completed_at: string;
  }[];
}

/** 
 * ドキュメント一覧を表示するコンポーネント
 * - 検索機能: タイトル、マンション名、タグでフィルタリング
 * - 階層表示: ドキュメント → 関連部分(チャンク)の階層で表示
 * - データ取得: サーバーサイドAPIを使用してドキュメントデータを取得
 * - エラー処理: データ取得失敗時の表示と再試行機能
 */
export function DocumentList({ searchQuery = "", initialDocuments = [] }: DocumentListProps) {
  const router = useRouter();
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<{ id: string; name: string }[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMethod, setSearchMethod] = useState<"hybrid_search" | "semantic_search" | "keyword_search" | "full_text_search">("hybrid_search");
  const [topK, setTopK] = useState(5);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // 検索結果をドキュメント単位でグループ化したもの
  const [groupedResults, setGroupedResults] = useState<Record<string, DocumentGroup>>({});
  // 展開されているドキュメントID
  const [expandedDocuments, setExpandedDocuments] = useState<{ [key: string]: boolean }>({});

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

  // 検索結果をドキュメント単位でグループ化する処理
  useEffect(() => {
    // 検索結果がなければ何もしない
    if (!searchResults.length) {
      setGroupedResults({});
      return;
    }

    // ドキュメントIDをキーにしてグループ化
    const grouped: Record<string, DocumentGroup> = {};

    searchResults.forEach(result => {
      // ドキュメントIDを取得（いろいろなプロパティパターンに対応）
      const documentId = result.document_id ||
        result.id ||
        result.segment?.document_id ||
        `doc-${Math.random()}`;

      // ドキュメント名を取得（いろいろなプロパティパターンに対応）
      const documentName = result.document_name ||
        result.title ||
        result.segment?.document?.name ||
        "無題のドキュメント";

      // 新しいドキュメントグループならキーを作成
      if (!grouped[documentId]) {
        grouped[documentId] = {
          id: documentId,
          title: documentName,
          building: result.building || result.metadata?.building || "未分類",
          tags: [],
          // その他のプロパティ
        };
      }

      // 関連部分（チャンク）の情報を追加
      if (result.segment || result.content) {
        grouped[documentId].chunks = grouped[documentId].chunks || [];
        grouped[documentId].chunks.push({
          id: result.segment?.id || `segment-${Math.random()}`,
          content: result.segment?.content || result.content || "",
          score: result.score || null,
          completed_at: result.segment?.completed_at || result.uploadedAt || new Date().toISOString()
        });
      }

      // タグがあれば追加
      if (result.tags && result.tags.length) {
        grouped[documentId].tags = result.tags;
      }
    });

    // グループ化した結果をセット
    setGroupedResults(grouped);

    // 全てのドキュメントを展開状態にする（初期表示）
    const initialExpanded: { [key: string]: boolean } = {};
    Object.keys(grouped).forEach(docId => {
      initialExpanded[docId] = true;
    });
    setExpandedDocuments(initialExpanded);

  }, [searchResults]);

  // 検索結果から日付を取得
  const formatDate = (timestamp: number | string) => {
    if (!timestamp) return "不明";

    // timestampがstring型の場合は、Dateオブジェクトに変換
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString('ja-JP');
    }

    // timestampが数値の場合はUNIXタイムスタンプとして扱う
    return new Date(timestamp * 1000).toLocaleDateString('ja-JP');
  };

  // 検索結果のスコアを％表示に変換
  const formatScore = (score: number) => {
    if (score === undefined || score === null) return "N/A";
    // スコアを0-100%の範囲に正規化
    const percent = Math.min(100, Math.max(0, score * 100));
    return `${percent.toFixed(1)}%`;
  };

  // ドキュメントの展開/折りたたみを切り替える
  const toggleDocumentExpand = (documentId: string) => {
    setExpandedDocuments(prev => ({
      ...prev,
      [documentId]: !prev[documentId]
    }));
  };

  // 検索結果をテキストとしてエクスポート
  const exportResults = () => {
    if (Object.keys(groupedResults).length === 0) return;

    let text = `検索クエリ: ${localSearchQuery}\n\n`;

    Object.values(groupedResults).forEach((doc, index) => {
      text += `【書類${index + 1}】 ${doc.title}\n`;
      text += `マンション: ${doc.building || "未分類"}\n`;

      if (doc.tags && doc.tags.length > 0) {
        text += `タグ: ${doc.tags.join(", ")}\n`;
      }

      text += "\n関連部分:\n";

      if (doc.chunks && doc.chunks.length > 0) {
        doc.chunks.forEach((chunk: any, segIndex: number) => {
          text += `\n------- 関連部分 ${segIndex + 1} -------\n`;
          if (chunk.score) {
            text += `関連度: ${formatScore(chunk.score)}\n`;
          }
          text += `${chunk.content}\n`;
        });
      } else {
        text += "関連部分が見つかりません\n";
      }

      text += "\n----------------------------------------\n\n";
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `検索結果_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ドキュメントの詳細を表示する
  const handleDocumentView = (documentId: string, chunkId?: string) => {
    const doc = groupedResults[documentId];

    // 選択された特定のチャンクがある場合はそれを先頭に
    if (chunkId && doc.chunks) {
      const targetChunk = doc.chunks.find((s: any) => s.id === chunkId);

      if (targetChunk) {
        setSelectedDocument({
          ...doc,
          // 選択されたチャンクを先頭に持ってくる
          viewingChunk: targetChunk
        });
      } else {
        setSelectedDocument(doc);
      }
    } else {
      setSelectedDocument(doc);
    }
  };

  // ドキュメント詳細表示モーダルを閉じる
  const closeDocumentView = () => {
    setSelectedDocument(null);
  };

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
          query: "*", // ワイルドカードクエリで全ドキュメント取得
          top_k: 50, // より多くのドキュメントを取得
          search_method: "keyword_search",
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
      if (result.records && Array.isArray(result.records)) {
        console.log("Documents found in records array:", result.records.length);

        // ドキュメント型に変換
        const formattedDocs = result.records.map((item: any) => ({
          id: item.document_id || item.id || `doc-${Math.random()}`,
          title: item.title || item.document_name || "無題ドキュメント",
          building: item.metadata?.building || item.building || "未分類",
          tags: Array.isArray(item.tags) ? item.tags : [],
          uploadedAt: item.uploaded_at || item.created_at || new Date().toISOString(),
          segment: item.segment || null,
          score: item.score || null,
        }));

        setSearchResults(formattedDocs);
      } else if (result.data && Array.isArray(result.data)) {
        setSearchResults(result.data);
      } else {
        console.warn("Unexpected response format:", result);
        setSearchResults([]);
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
          top_k: topK,
          search_method: searchMethod,
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
          title: item.title || item.document_name || item.segment?.document?.name || "無題ドキュメント",
          building: item.metadata?.building || item.building || "未分類",
          tags: Array.isArray(item.tags) ? item.tags : [],
          uploadedAt: item.uploaded_at || item.created_at || new Date().toISOString(),
          segment: item.segment || null,
          score: item.score || null,
          content: item.content || item.segment?.content || null,
        }));

        setSearchResults(formattedDocs);
      } else if (result.data && Array.isArray(result.data)) {
        setSearchResults(result.data);
      } else {
        console.warn("Unexpected search response format:", result);
        setSearchResults([]);
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

  // 内容のプレビューテキスト（最初の100文字程度）を取得
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (!content) return "内容なし";

    if (content.length <= maxLength) return content;

    return content.substring(0, maxLength) + "...";
  };

  // 文字列から重要な「条」や「項」の情報を抽出して強調表示
  const highlightImportantSections = (content: string) => {
    if (!content) return <span className="text-muted-foreground">内容なし</span>;

    // 「第X条」または「X項」のパターンを検出
    const articlePattern = /(第\s*\d+\s*条|第\s*\d+\s*項|\d+\s*条|\d+\s*項)/g;
    const parts = content.split(articlePattern);

    if (parts.length === 1) {
      // パターンに一致しなければそのまま表示
      return <span>{getContentPreview(content)}</span>;
    }

    // マッチした部分を強調表示
    const matches = content.match(articlePattern) || [];
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && matches[i - 1] && (
              <span className="font-bold bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded mr-1">
                {matches[i - 1]}
              </span>
            )}
            {getContentPreview(part, i === 0 ? 50 : 50)}
          </span>
        ))}
      </>
    );
  };

  if (isLoading) {
    return <div className="py-8 text-center">書類データを読み込み中...</div>;
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

        {/* 検索方法の選択 */}
        <div>
          <label htmlFor="search-method" className="block text-sm font-medium text-gray-700 mb-1">
            検索方法
          </label>
          <Select
            value={searchMethod}
            onValueChange={(value) => setSearchMethod(value as any)}
          >
            <SelectTrigger id="search-method" disabled={isLoading}>
              <SelectValue placeholder="検索方法を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hybrid_search">ハイブリッド検索（推奨）</SelectItem>
              <SelectItem value="semantic_search">セマンティック検索</SelectItem>
              <SelectItem value="keyword_search">キーワード検索</SelectItem>
              <SelectItem value="full_text_search">全文検索</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            ハイブリッド検索は意味的検索とキーワード検索を組み合わせた方法です
          </p>
        </div>

        {/* 結果の数を選択 */}
        <div>
          <label htmlFor="top-k" className="block text-sm font-medium text-gray-700 mb-1">
            表示する結果の数
          </label>
          <Select
            value={topK.toString()}
            onValueChange={(value) => setTopK(Number(value))}
          >
            <SelectTrigger id="top-k" disabled={isLoading}>
              <SelectValue placeholder="表示件数" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3件</SelectItem>
              <SelectItem value="5">5件</SelectItem>
              <SelectItem value="10">10件</SelectItem>
              <SelectItem value="20">20件</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 relative">
          <Input
            placeholder="キーワードで検索..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10"
            onKeyDown={(e) => {
              // Enterキーで検索を実行
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <Button onClick={handleSearch} className="mt-2 w-full md:w-auto">検索</Button>
      </div>

      {/* 検索結果表示 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">検索結果</h2>
          {Object.keys(groupedResults).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              テキストでエクスポート
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading && <p className="text-muted-foreground py-4">検索中...</p>}

        {/* グループ化された検索結果表示 */}
        {!isLoading && Object.keys(groupedResults).length > 0 && (
          <div className="space-y-4">
            {Object.values(groupedResults).map((doc: any) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4 bg-muted/30 cursor-pointer"
                  onClick={() => toggleDocumentExpand(doc.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-md font-medium">
                        {doc.title || "無題のドキュメント"}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-muted/30">
                        {doc.chunks?.length || 0} 関連部分
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="展開切替">
                        {expandedDocuments[doc.id] ?
                          <ChevronDown className="h-4 w-4" /> :
                          <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-muted-foreground">
                      マンション: {doc.building || "未分類"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags && doc.tags.length > 0 ?
                        doc.tags.slice(0, 3).map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-muted/30 text-xs">
                            {tag}
                          </Badge>
                        )) : null}
                      {doc.tags && doc.tags.length > 3 ?
                        <Badge variant="outline" className="bg-muted/30 text-xs">
                          +{doc.tags.length - 3}
                        </Badge> : null}
                    </div>
                  </div>
                </CardHeader>

                {/* 関連部分（チャンク）一覧 - 折りたたみ可能 */}
                {expandedDocuments[doc.id] && doc.chunks && doc.chunks.length > 0 && (
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60%]">内容</TableHead>
                          <TableHead>関連度</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* 関連度スコアでソート */}
                        {doc.chunks
                          .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                          .map((chunk: any, index: number) => (
                            <TableRow key={chunk.id || index} className="hover:bg-muted/50">
                              <TableCell>
                                {highlightImportantSections(chunk.content)}
                              </TableCell>
                              <TableCell>
                                {chunk.score ? (
                                  <Badge variant="secondary">{formatScore(chunk.score)}</Badge>
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDocumentView(doc.id, chunk.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">詳細表示</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}

                {/* 関連部分がない場合のメッセージ */}
                {expandedDocuments[doc.id] && (!doc.chunks || doc.chunks.length === 0) && (
                  <CardContent>
                    <p className="text-center text-muted-foreground py-4">
                      この書類には検索条件に一致する関連部分が見つかりませんでした
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* ドキュメント詳細表示 */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedDocument.title || "無題のドキュメント"}
                </h3>
                <Button variant="ghost" size="sm" onClick={closeDocumentView}>×</Button>
              </div>
              <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
                {/* 特定のチャンクを表示 */}
                {selectedDocument.viewingChunk && (
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold">関連部分</h4>
                      {selectedDocument.viewingChunk.score && (
                        <Badge variant="secondary">
                          関連度: {formatScore(selectedDocument.viewingChunk.score)}
                        </Badge>
                      )}
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded border border-yellow-200 dark:border-yellow-900/30 mb-4">
                      <pre className="whitespace-pre-wrap font-sans">{selectedDocument.viewingChunk.content}</pre>
                    </div>
                  </div>
                )}

                {/* 全てのチャンク一覧 */}
                {selectedDocument.chunks && selectedDocument.chunks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      文書内の全ての関連部分 ({selectedDocument.chunks.length}件)
                    </h4>
                    <div className="bg-muted/50 p-4 rounded border max-h-64 overflow-y-auto space-y-4">
                      {selectedDocument.chunks
                        .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                        .map((chunk: any, index: number) => (
                          <div key={chunk.id || index}
                            className={`p-3 rounded border ${selectedDocument.viewingChunk?.id === chunk.id ?
                              'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30' :
                              'bg-white dark:bg-background'
                              }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">関連部分 {index + 1}</span>
                              {chunk.score && (
                                <Badge variant="secondary" className="text-xs">
                                  関連度: {formatScore(chunk.score)}
                                </Badge>
                              )}
                            </div>
                            <pre className="whitespace-pre-wrap font-sans text-sm">{chunk.content}</pre>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-1">マンション</h4>
                    <p>{selectedDocument.building || "未分類"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">ドキュメントID</h4>
                    <p className="text-sm font-mono">{selectedDocument.id || "不明"}</p>
                  </div>
                </div>

                {/* タグ表示 */}
                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">タグ</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDocument.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end">
                <Button variant="outline" size="sm" onClick={closeDocumentView}>閉じる</Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && Object.keys(groupedResults).length === 0 && localSearchQuery && !error && (
          <div className="text-muted-foreground p-4 border rounded bg-muted/30 text-center">
            検索結果が見つかりません。別のキーワードで試してください。
          </div>
        )}

        {!localSearchQuery && !isLoading && !error && Object.keys(groupedResults).length === 0 && (
          <div className="text-muted-foreground p-4 border rounded bg-muted/30 text-center">
            キーワードを入力して検索ボタンをクリックしてください。
          </div>
        )}
      </div>
    </div>
  );
}
