"use server";

const DIFY_API_ENDPOINT =
  process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY || "";

/**
 * Dify APIへのリクエストを送信する基本関数
 * @param endpoint APIエンドポイント
 * @param method HTTPメソッド
 * @param body リクエストボディ（オプション）
 * @returns APIレスポンス
 */
export async function difyRequest(
  endpoint: string,
  method: string,
  body?: any
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DIFY_API_KEY}`,
  };

  const response = await fetch(`${DIFY_API_ENDPOINT}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "APIリクエストに失敗しました");
  }

  return response.json();
}

/**
 * Dify APIへのFormDataリクエストを送信する関数
 * @param endpoint APIエンドポイント
 * @param method HTTPメソッド
 * @param formData フォームデータ
 * @returns APIレスポンス
 */
export async function difyFormDataRequest(
  endpoint: string,
  method: string,
  formData: FormData
) {
  const headers = {
    Authorization: `Bearer ${DIFY_API_KEY}`,
  };

  const response = await fetch(`${DIFY_API_ENDPOINT}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "APIリクエストに失敗しました");
  }

  return response.json();
}
