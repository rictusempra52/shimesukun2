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
