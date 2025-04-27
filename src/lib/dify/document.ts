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

/**
 * テキストからドキュメントを作成
 * @param datasetId - ナレッジベースID
 * @param text - 登録するテキスト
 * @param metadata - メタデータ（タイトル、ドキュメントID等）
 * @param indexingTechnique - インデックス方法
 */
export async function createDocumentFromText(
  datasetId: string,
  text: string,
  metadata: { title?: string; document_id?: string } = {},
  indexingTechnique: "high_quality" | "economy" = "high_quality"
) {
  const data = {
    document: {
      text: text,
      metadata: metadata,
    },
    indexing_technique: indexingTechnique,
    process_rule: { mode: "automatic" },
  };

  return difyKnowledgeRequest(
    `/datasets/${datasetId}/document/create-by-text`,
    "POST",
    data
  );
}

/**
 * ドキュメントのインデックス作成状況を確認
 * @param datasetId - ナレッジベースID
 * @param documentId - ドキュメントID
 * @param batch - バッチID
 * @returns インデックス作成の状況
 */
export async function checkDocumentIndexingStatus(
  datasetId: string,
  documentId: string,
  batch: string
) {
  return difyKnowledgeRequest(
    `/datasets/${datasetId}/documents/${documentId}/indexing-status/${batch}`,
    "GET"
  );
}
