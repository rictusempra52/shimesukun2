"use client";

import { useState, useEffect } from "react";
import { getKnowledgeBasesFromClient, searchKnowledgeBase } from "@/lib/dify/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Search, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Dify ナレッジAPIを使った書類検索コンポーネント
 * 書類を探す画面で使用するための最適化された検索UI
 */
export default function DifyDocumentSearch() {
    // 状態管理
    const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(5); // 初期表示件数は5件

    // ナレッジベース一覧を取得
    useEffect(() => {
        async function fetchKnowledgeBases() {
            setLoading(true);
            setError(null);
            try {
                const result = await getKnowledgeBasesFromClient();
                setKnowledgeBases(result.data || []);
                if (result.data && result.data.length > 0)
                    setSelectedKnowledgeBase(result.data[0].id);
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
            // 検索結果を10件取得（要件より多めに取得しておき、表示数を制限）
            const result = await searchKnowledgeBase(
                selectedKnowledgeBase,
                searchQuery,
                10, // 検索結果は多めに取得
                "hybrid_search" // ハイブリッド検索固定
            );
            setSearchResults(result.records || []);
            setDisplayCount(5); // 初期表示件数をリセット

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

    // もっと見るボタンの処理
    const handleShowMore = () => {
        setDisplayCount(prev => prev + 5); // 5件ずつ増やす
    };

    // 検索結果のスコアを％表示に変換
    const formatScore = (score: number) => {
        if (score === undefined || score === null) return "N/A";
        const percent = Math.min(100, Math.max(0, score * 100));
        return `${percent.toFixed(1)}%`;
    };

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">AI による書類検索</h2>
                <p className="text-sm text-muted-foreground">
                    書類の内容を理解して検索します。キーワードだけでなく、文脈も考慮した検索が可能です。
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="検索キーワードを入力..."
                        className="pl-10"
                        disabled={loading || !selectedKnowledgeBase}
                    />
                </div>
                <Button type="submit" disabled={loading || !selectedKnowledgeBase}>
                    {loading ? "検索中..." : "検索"}
                </Button>
            </form>

            {/* 検索結果表示 */}
            {!loading && searchResults.length > 0 && (
                <div className="space-y-4">
                    {searchResults.slice(0, displayCount).map((result, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">
                                            {result.segment?.document?.name || "無題のドキュメント"}
                                        </h3>
                                    </div>
                                    <Badge variant="secondary">関連度: {formatScore(result.score)}</Badge>
                                </div>

                                <div className="mt-2 bg-muted/50 p-3 rounded-md text-sm max-h-36 overflow-y-auto">
                                    {result.segment?.content || "内容なし"}
                                </div>

                                {result.segment?.keywords && result.segment.keywords.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-1">
                                            {result.segment.keywords.map((keyword: string, idx: number) => (
                                                <Badge key={idx} variant="outline">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {displayCount < searchResults.length && (
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={handleShowMore}
                                className="flex items-center gap-2"
                            >
                                もっと見る
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {!loading && searchResults.length === 0 && searchQuery && !error && (
                <div className="bg-muted p-6 rounded-lg text-center text-muted-foreground">
                    検索結果が見つかりません。別のキーワードで試してください。
                </div>
            )}

            {!searchQuery && !loading && !error && (
                <div className="bg-muted p-6 rounded-lg text-center text-muted-foreground">
                    検索キーワードを入力して検索ボタンをクリックしてください。
                </div>
            )}
        </div>
    );
}