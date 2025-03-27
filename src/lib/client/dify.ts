"use client"; // クライアントサイド専用と明示

/**
 * クライアントからDify APIを安全に呼び出すためのラッパー関数
 */
export async function askAI(query: string): Promise<any> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "AIリクエストに失敗しました");
  }

  return response.json();
}
