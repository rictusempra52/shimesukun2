"use server";

import {
  difyKnowledgeRequest,
  difyKnowledgeFormDataRequest,
} from "./api-service";

/**
 * ナレッジベース一覧を取得する関数
 * @param page ページ番号
 * @param limit 1ページあたりの件数
 * @returns ナレッジベース一覧
 */
export async function getKnowledgeBases(page = 1, limit = 20) {
  return difyKnowledgeRequest(`/datasets?page=${page}&limit=${limit}`, "GET");
}

/**
 * 文書をナレッジベースにアップロードする関数
 * @param datasetId ナレッジベースID
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadDocument(datasetId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return difyKnowledgeFormDataRequest(
    `/datasets/${datasetId}/documents`,
    "POST",
    formData
  );
}
