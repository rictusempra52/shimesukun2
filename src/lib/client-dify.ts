/**
 * クライアントからDify APIを呼び出すためのラッパー関数
 * @param {string} query - 質問内容
 * @returns {Promise<any>} - APIのレスポンス
 */
export async function fetchDifyResponse(query: string): Promise<any> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Dify API request failed");
  }

  return response.json();
}
