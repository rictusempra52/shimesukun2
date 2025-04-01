"use server";

import { difyRequest, difyFormDataRequest } from "./api-service";

/**
 * ナレッジベース一覧を取得する関数
 * @param page ページ番号
 * @param limit 1ページあたりの件数
 * @returns ナレッジベース一覧
 */
export async function getKnowledgeBases(page = 1, limit = 20) {
  return difyRequest(`/datasets?page=${page}&limit=${limit}`, "GET");
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

  return difyFormDataRequest(
    `/datasets/${datasetId}/documents`,
    "POST",
    formData
  );
}
