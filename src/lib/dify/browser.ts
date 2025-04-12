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
  console.log("ナレッジベース:", response);
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
  query: string | null = null, // クエリをオプションに変更
  topK: number = 3,
  searchMethod:
    | "hybrid_search"
    | "semantic_search"
    | "keyword_search"
    | "full_text_search" = "hybrid_search"
) {
  const body: any = {
    top_k: topK,
    search_method: searchMethod,
  };

  if (query) {
    body.query = query; // クエリが存在する場合のみ追加
  }

  const response = await fetch(`/api/knowledge/${knowledgeBaseId}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "検索に失敗しました");
  }

  return response.json();
}

/**
 * ナレッジベースにドキュメントをアップロードする関数
 * @param knowledgeBaseId ナレッジベースID
 * @param file アップロードするファイル
 * @param metadata ファイルに関連するメタデータ（任意）
 * @returns アップロード結果
 */
export async function uploadDocumentToKnowledgeBase(
  knowledgeBaseId: string,
  file: File,
  metadata?: Record<string, any>
) {
  const formData = new FormData();
  formData.append("file", file);

  // メタデータがある場合は追加
  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  console.log(
    `ナレッジベースID ${knowledgeBaseId} にファイル ${file.name} をアップロード中...`
  );

  const response = await fetch(`/api/knowledge/${knowledgeBaseId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ドキュメントのアップロードに失敗しました");
  }

  return response.json();
}
