import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// サーバー環境でのみアクセス可能なAPIキー
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const geminiModel = "gemini-2.0-flash"; // 最適なモデル

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // リクエストからbase64エンコードされた画像データを取得
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 }
      );
    }

    // Gemini APIクライアントを初期化
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: geminiModel });

    // OCR実行用プロンプト
    const MARKDOWN_PROMPT = `
OCR the following page into Markdown. Tables should be formatted as HTML.
Do not surround your output with triple backticks.
Chunk the document into sections of roughly 250 - 1000 words.
Surround each chunk with <chunk> and </chunk> tags.
Preserve as much content as possible, including headings, tables, etc.
Don't try to output any image.
Output should be in Japanese if the original text is in Japanese.
`;

    // Gemini APIに画像を送信して処理
    const result = await model.generateContent([
      MARKDOWN_PROMPT,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png",
        },
      },
    ]);

    // レスポンステキストを取得
    const response = await result.response;
    const markdown = response.text();

    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: `Failed to extract text: ${error.message}` },
      { status: 500 }
    );
  }
}
