"use client";

/**
 * Dify API を使用して質問を処理（クライアント側から安全に呼び出せる）
 * @param {string} query - 質問内容
 * @returns {Promise<any>} - APIの応答
 */
export async function askAI(query: string) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * クライアントサイドでDify API（Next.js API Route経由）を呼び出すためのユーティリティ関数
 */

/**
 * ナレッジベースのリストを取得
 * @param page - ページ番号
 * @param limit - 取得件数
 */
export async function getKnowledgeBases(page = 1, limit = 20) {
  const response = await fetch(`/api/knowledge?page=${page}&limit=${limit}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ナレッジベースの取得に失敗しました");
  }

  return response.json();
}

/**
 * 新しいナレッジベースを作成
 */
export async function createKnowledgeBase({
  name,
  description,
  permission = "only_me",
  indexingTechnique = "high_quality",
}: {
  name: string;
  description?: string;
  permission?: "only_me" | "all_team_members" | "partial_members";
  indexingTechnique?: "high_quality" | "economy";
}) {
  const response = await fetch("/api/knowledge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      permission,
      indexingTechnique,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ナレッジベースの作成に失敗しました");
  }

  return response.json();
}

/**
 * ナレッジベースを削除
 * @param datasetId - ナレッジベースID
 */
export async function deleteKnowledgeBase(datasetId: string) {
  const response = await fetch(`/api/knowledge/${datasetId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ナレッジベースの削除に失敗しました");
  }

  return response.json();
}

/**
 * ナレッジベースからテキスト検索
 * @param datasetId - ナレッジベースID
 * @param query - 検索クエリ
 * @param topK - 取得する結果の数
 * @param searchMethod - 検索方法
 */
export async function searchKnowledgeBase(
  datasetId: string,
  query: string,
  topK = 3,
  searchMethod = "hybrid_search"
) {
  const response = await fetch(`/api/knowledge/${datasetId}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      topK,
      searchMethod,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "検索に失敗しました");
  }

  return response.json();
}

/**
 * ナレッジベース内のドキュメント一覧を取得
 * @param datasetId - ナレッジベースID
 * @param page - ページ番号
 * @param limit - 取得件数
 * @param keyword - 検索キーワード（オプション）
 */
export async function getDocuments(
  datasetId: string,
  page = 1,
  limit = 20,
  keyword?: string
) {
  let url = `/api/knowledge/${datasetId}/document?page=${page}&limit=${limit}`;
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ドキュメント一覧の取得に失敗しました");
  }

  return response.json();
}

/**
 * テキストからドキュメントを作成
 * @param datasetId - ナレッジベースID
 * @param name - ドキュメント名
 * @param text - テキスト内容
 * @param indexingTechnique - インデックス方法
 */
export async function createDocumentFromText(
  datasetId: string,
  name: string,
  text: string,
  indexingTechnique = "high_quality"
) {
  const response = await fetch(`/api/knowledge/${datasetId}/document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      text,
      indexingTechnique,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ドキュメントの作成に失敗しました");
  }

  return response.json();
}

/**
 * ファイルからドキュメントを作成
 * @param datasetId - ナレッジベースID
 * @param file - アップロードするファイル
 * @param indexingTechnique - インデックス方法
 */
export async function createDocumentFromFile(
  datasetId: string,
  file: File,
  indexingTechnique = "high_quality"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("indexingTechnique", indexingTechnique);

  const response = await fetch(`/api/knowledge/${datasetId}/document/file`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ドキュメントの作成に失敗しました");
  }

  return response.json();
}

/**
 * ドキュメントを削除
 * @param datasetId - ナレッジベースID
 * @param documentId - ドキュメントID
 */
export async function deleteDocument(datasetId: string, documentId: string) {
  const response = await fetch(
    `/api/knowledge/${datasetId}/document/${documentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "ドキュメントの削除に失敗しました");
  }

  return response.json();
}

/**
 * ドキュメントインデックス作成状況を確認
 * @param datasetId - ナレッジベースID
 * @param batch - バッチID
 */
export async function checkDocumentIndexingStatus(
  datasetId: string,
  batch: string
) {
  const response = await fetch(
    `/api/knowledge/${datasetId}/document/status/${batch}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "インデックス状態の確認に失敗しました");
  }

  return response.json();
}
