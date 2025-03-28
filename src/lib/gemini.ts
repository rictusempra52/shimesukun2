// gemini.ts
// AI回答を生成するための関数を提供します。
// この関数は、Google Generative AI APIを使用して質問に回答を生成します。

const GEMINI_API_ENDPOINT = `${process.env.DIFY_API_ENDPOINT}/ask`;

export async function askGemini(question: string) {
  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in Gemini API request:", error);
    throw error;
  }
}
