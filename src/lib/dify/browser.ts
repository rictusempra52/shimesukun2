// browser.ts
// このファイルは、クライアントサイドでDify APIを使用してナレッジベースの一覧を取得するための関数を定義しています

"use client";

/**
 * クライアントサイドでナレッジベース一覧を取得する関数
 * @param page ページ番号
 * @param limit 1ページあたりの件数
 * @returns ナレッジベース一覧
 */
export async function getKnowledgeBasesFromClient(page = 1, limit = 20) {
  const response = await fetch(`/api/knowledge?page=${page}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ナレッジベース取得に失敗しました");
  }

  return response.json();
}

/**
 * ナレッジベースを検索する関数
 * @param knowledgeBaseId ナレッジベースID
 * @param query 検索クエリ
 * @param topK 検索結果の上位件数
 * @param searchMethod 検索方法
 * @returns 検索結果
 */
export async function searchKnowledgeBase(
  knowledgeBaseId: string,
  query: string,
  topK: number = 3,
  searchMethod:
    | "hybrid_search"
    | "semantic_search"
    | "keyword_search"
    | "full_text_search" = "hybrid_search"
) {
  const response = await fetch(`/api/knowledge/${knowledgeBaseId}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      top_k: topK,
      search_method: searchMethod,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "検索に失敗しました");
  }

  return response.json();
}
