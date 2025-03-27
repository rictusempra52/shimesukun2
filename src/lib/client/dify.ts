"use client";

/**
 * Dify API を使用して質問を処理
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
