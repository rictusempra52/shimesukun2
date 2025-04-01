// document.ts
// このファイルは、ナレッジベース内のドキュメントに関連するAPI呼び出しを行うための関数を定義しています
// 具体的には、ドキュメントの取得、作成、削除、インデックス作成状況の確認などを行います

"use server";

import {
  difyKnowledgeRequest,
  difyKnowledgeFormDataRequest,
} from "./api-service";

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
  keyword = ""
) {
  let endpoint = `/datasets/${datasetId}/documents?page=${page}&limit=${limit}`;
  if (keyword) {
    endpoint += `&keyword=${encodeURIComponent(keyword)}`;
  }
  return difyKnowledgeRequest(endpoint, "GET");
}

/**
 * ドキュメントの詳細を取得
 * @param datasetId - ナレッジベースID
 * @param documentId - ドキュメントID
 */
export async function getDocument(datasetId: string, documentId: string) {
  return difyKnowledgeRequest(
    `/datasets/${datasetId}/documents/${documentId}`,
    "GET"
  );
}

/**
 * ドキュメントを削除
 * @param datasetId - ナレッジベースID
 * @param documentId - ドキュメントID
 */
export async function deleteDocument(datasetId: string, documentId: string) {
  return difyKnowledgeRequest(
    `/datasets/${datasetId}/documents/${documentId}`,
    "DELETE"
  );
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
  indexingTechnique: "high_quality" | "economy" = "high_quality"
) {
  const formData = new FormData();
  const dataJson = JSON.stringify({
    indexing_technique: indexingTechnique,
    process_rule: { mode: "automatic" },
  });

  formData.append("data", new Blob([dataJson], { type: "text/plain" }));
  formData.append("file", file);

  return difyKnowledgeFormDataRequest(
    `/datasets/${datasetId}/document/create-by-file`,
    "POST",
    formData
  );
}
