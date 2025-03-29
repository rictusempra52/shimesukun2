"use client";

import { useState, useEffect } from "react";
import { getKnowledgeBases, searchKnowledgeBase } from "@/lib/client/dify";

/**
 * ナレッジベース検索コンポーネント
 * Difyのナレッジベースを横断検索するUI
 */
export default function KnowledgeSearch() {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMethod, setSearchMethod] = useState<"hybrid_search" | "semantic_search" | "keyword_search" | "full_text_search">("hybrid_search");
  const [topK, setTopK] = useState(3);

  // ナレッジベース一覧を取得
  useEffect(() => {
    async function fetchKnowledgeBases() {
      setLoading(true);
      setError(null);
      try {
        const result = await getKnowledgeBases();
        setKnowledgeBases(result.data || []);
        // 最初のナレッジベースを自動選択（オプション）
        if (result.data && result.data.length > 0) {
          setSelectedKnowledgeBase(result.data[0].id);
        }
      } catch (error: any) {
        setError(error.message || "ナレッジベースの取得に失敗しました");
        console.error("ナレッジベース取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKnowledgeBases();
  }, []);

  // 検索実行
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedKnowledgeBase) {
      setError("検索するナレッジベースを選択してください");
      return;
    }

    if (!searchQuery.trim()) {
      setError("検索キーワードを入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await searchKnowledgeBase(
        selectedKnowledgeBase, 
        searchQuery,
        topK,
        searchMethod
      );
      setSearchResults(result.records || []);
      
      if ((result.records || []).length === 0) {
        setError("検索結果が見つかりませんでした");
      }
    } catch (error: any) {
      setError(error.message || "検索に失敗しました");
      console.error("検索エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // 検索結果から日付を取得
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "不明";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // 検索結果のスコアを％表示に変換
  const formatScore = (score: number) => {
    if (score === undefined || score === null) return "N/A";
    // スコアを0-100%の範囲に正規化（適宜調整が必要）
    const percent = Math.min(100, Math.max(0, score * 100));
    return `${percent.toFixed(1)}%`;
  };

  // 検索結果をテキストとしてエクスポート
  const exportResults = () => {
    if (searchResults.length === 0) return;

    let text = `検索クエリ: ${searchQuery}\n\n`;
    searchResults.forEach((result, index) => {
      text += `【${index + 1}】 ${result.segment?.document?.name || "無題のドキュメント"}\n`;
      text += `関連度: ${formatScore(result.score)}\n`;
      text += `内容:\n${result.segment?.content || "内容なし"}\n\n`;
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ナレッジベース検索</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* ナレッジベース選択 */}
          <div>
            <label htmlFor="knowledge-base" className="block text-sm font-medium text-gray-700 mb-1">
              検索するナレッジベース
            </label>
            <select
              id="knowledge-base"
              value={selectedKnowledgeBase || ""}
              onChange={(e) => setSelectedKnowledgeBase(e.target.value)}
              className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || knowledgeBases.length === 0}
            >
              <option value="">ナレッジベースを選択</option>
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name} (ドキュメント数: {kb.document_count})
                </option>
              ))}
            </select>
          </div>

          {/* 検索方法の選択 */}
          <div>
            <label htmlFor="search-method" className="block text-sm font-medium text-gray-700 mb-1">
              検索方法
            </label>
            <select
              id="search-method"
              value={searchMethod}
              onChange={(e) => setSearchMethod(e.target.value as any)}
              className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="hybrid_search">ハイブリッド検索（推奨）</option>
              <option value="semantic_search">セマンティック検索</option>
              <option value="keyword_search">キーワード検索</option>
              <option value="full_text_search">全文検索</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              ハイブリッド検索は意味的検索とキーワード検索を組み合わせた方法で、最も良い結果が得られます。
            </p>
          </div>

          {/* 結果の数を選択 */}
          <div>
            <label htmlFor="top-k" className="block text-sm font-medium text-gray-700 mb-1">
              表示する結果の数
            </label>
            <select
              id="top-k"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="1">1件</option>
              <option value="3">3件</option>
              <option value="5">5件</option>
              <option value="10">10件</option>
            </select>
          </div>

          {/* 検索キーワード入力 */}
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
              検索キーワード
            </label>
            <div className="flex">
              <input
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="キーワードを入力..."
                className="flex-grow p-2 border rounded-l shadow-sm focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r shadow"
                disabled={loading || !selectedKnowledgeBase}
                aria-label="検索実行"
              >
                {loading ? "検索中..." : "検索"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 検索結果表示 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">検索結果</h2>
          {searchResults.length > 0 && (
            <button
              onClick={exportResults}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              aria-label="検索結果をエクスポート"
            >
              テキストでエクスポート
            </button>
          )}
        </div>
        
        {loading && <p className="text-gray-500">検索中...</p>}
        
        {!loading && searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="border rounded p-4 bg-white shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">
                    {result.segment?.document?.name || "無題のドキュメント"}
                  </h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    関連度: {formatScore(result.score)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-2">
                  <span className="mr-4">ドキュメントID: {result.segment?.document_id || "不明"}</span>
                  <span>セグメントID: {result.segment?.id || "不明"}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border mb-2 max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {result.segment?.content || "内容なし"}
                  </pre>
                </div>
                
                {result.segment?.answer && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">回答:</div>
                    <div className="bg-yellow-50 p-3 rounded border">
                      {result.segment.answer}
                    </div>
                  </div>
                )}
                
                {result.segment?.keywords && result.segment.keywords.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">キーワード:</div>
                    <div className="flex flex-wrap gap-1">
                      {result.segment.keywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  インデックス更新日: {formatDate(result.segment?.completed_at)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && searchResults.length === 0 && searchQuery && !error && (
          <div className="text-gray-500 p-4 border rounded bg-gray-50 text-center">
            検索結果が見つかりません。別のキーワードで試してください。
          </div>
        )}
        
        {!searchQuery && !loading && !error && (
          <div className="text-gray-500 p-4 border rounded bg-gray-50 text-center">
            キーワードを入力して検索ボタンをクリックしてください。
          </div>
        )}
      </div>
    </div>
  );
}
