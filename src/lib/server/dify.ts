"use server"; // サーバーサイド専用コードと明示

const apiKey = process.env.DIFY_API_KEY || "";
const apiEndpoint = "https://api.dify.ai/v1";

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
