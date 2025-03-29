"use server";

import { difyRequest } from "./client";

/**
 * ナレッジベースのリストを取得
 * @param page - ページ番号
 * @param limit - 取得件数
 */
export async function getKnowledgeBases(page = 1, limit = 20) {
  return difyRequest(`/datasets?page=${page}&limit=${limit}`, "GET");
}

/**
 * 新しいナレッジベースを作成
 * @param name - ナレッジベース名
 * @param description - 説明（オプション）
 * @param permission - 権限設定
 */
export async function createKnowledgeBase(
  name: string,
  description?: string,
  permission: "only_me" | "all_team_members" | "partial_members" = "only_me",
  indexingTechnique: "high_quality" | "economy" = "high_quality"
) {
  return difyRequest("/datasets", "POST", {
    name,
    description,
    permission,
    indexing_technique: indexingTechnique,
  });
}

/**
 * ナレッジベースを削除
 * @param datasetId - ナレッジベースID
 */
export async function deleteKnowledgeBase(datasetId: string) {
  return difyRequest(`/datasets/${datasetId}`, "DELETE");
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
  searchMethod:
    | "hybrid_search"
    | "semantic_search"
    | "keyword_search"
    | "full_text_search" = "hybrid_search"
) {
  return difyRequest(`/datasets/${datasetId}/retrieve`, "POST", {
    query,
    retrieval_model: {
      search_method: searchMethod,
      reranking_enable: false,
      top_k: topK,
      score_threshold_enabled: false,
    },
  });
}
