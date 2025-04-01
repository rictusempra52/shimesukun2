"use server";

import { difyRequest, difyFormDataRequest } from ".api-service";

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
  let url = `/datasets/${datasetId}/documents?page=${page}&limit=${limit}`;
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }
  return difyRequest(url, "GET");
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
  indexingTechnique: "high_quality" | "economy" = "high_quality"
) {
  return difyRequest(`/datasets/${datasetId}/document/create-by-text`, "POST", {
    name,
    text,
    indexing_technique: indexingTechnique,
    process_rule: { mode: "automatic" },
    doc_form: "text_model",
  });
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

  return difyFormDataRequest(
    `/datasets/${datasetId}/document/create-by-file`,
    formData
  );
}

/**
 * ドキュメントを削除
 * @param datasetId - ナレッジベースID
 * @param documentId - ドキュメントID
 */
export async function deleteDocument(datasetId: string, documentId: string) {
  return difyRequest(
    `/datasets/${datasetId}/documents/${documentId}`,
    "DELETE"
  );
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
  return difyRequest(
    `/datasets/${datasetId}/documents/${batch}/indexing-status`,
    "GET"
  );
}
