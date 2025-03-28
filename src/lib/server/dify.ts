"use server"; // サーバーサイド専用コードと明示

const { serverEnv } = require("@/lib/env/server");

// 環境変数から安全にAPIキーとエンドポイントを取得
const apiKey = serverEnv.DIFY_API_KEY;
const apiEndpoint = serverEnv.DIFY_API_ENDPOINT;

/**
 * Dify APIを呼び出す関数（サーバーサイド専用）
 */
export async function fetchDifyResponse(query: string): Promise<any> {
  if (!apiKey) {
    throw new Error("Dify APIキーが設定されていません");
  }

  const response = await fetch(`${apiEndpoint}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Dify APIリクエストに失敗しました");
  }

  return response.json();
}
