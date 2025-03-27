"use server";

const { serverEnv } = require("../../../env/schema");

/**
 * Gemini API を使用してマンション管理に関する質問を処理
 * @param {string} question - 質問内容
 * @returns {Promise<any>} - APIの応答
 */
export async function askBuildingManagementQuestion(question: any) {
  const apiKey = serverEnv.GEMINI_API_KEY;
  const endpoint = "https://api.gemini.example.com/ask";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  return response.json();
}
