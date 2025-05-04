/**
 * Gemini APIを使用するためのユーティリティ関数
 * PDFのOCRやマークダウン変換などの処理をサポート
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini APIの設定
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const geminiModel = "gemini-2.0-flash"; // 最適なモデル

/**
 * Gemini APIのクライアントを作成
 */
export const getGeminiClient = () => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

/**
 * 画像からテキストを抽出してマークダウンに変換
 *
 * @param imageBuffer - 画像データのバッファ
 * @returns マークダウンフォーマットされたテキスト
 */
export async function extractTextAsMarkdown(
  imageBuffer: ArrayBuffer
): Promise<string> {
  try {
    const genAI = getGeminiClient();
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

    // 画像データをBase64に変換
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Gemini APIに画像を送信して処理
    const result = await model.generateContent([
      MARKDOWN_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png",
        },
      },
    ]);

    // レスポンステキストを取得
    const response = await result.response;
    const markdown = response.text();

    return markdown;
  } catch (error: any) {
    console.error("Gemini APIエラー:", error);
    throw new Error(`Geminiによるテキスト抽出に失敗しました: ${error.message}`);
  }
}

/**
 * PDFの各ページをMarkdownに変換する
 *
 * @param pdfPagesAsImages - PDFの各ページを画像として表現したバッファの配列
 * @param progressCallback - 処理の進捗を報告するコールバック関数（0-100）
 * @returns チャンク化されたMarkdownテキストの配列
 */
export async function convertPDFToMarkdown(
  pdfPagesAsImages: ArrayBuffer[],
  progressCallback?: (progress: number) => void
): Promise<string[]> {
  const markdownChunks: string[] = [];

  // 各ページを順番に処理
  for (let i = 0; i < pdfPagesAsImages.length; i++) {
    try {
      console.log(`ページ ${i + 1}/${pdfPagesAsImages.length} を処理中...`);

      // 進捗状況を報告
      if (progressCallback) {
        const progress = Math.floor((i / pdfPagesAsImages.length) * 100);
        progressCallback(progress);
      }

      // ページの画像からテキストを抽出
      const pageMarkdown = await extractTextAsMarkdown(pdfPagesAsImages[i]);

      // チャンクを抽出
      const chunkRegex = /<chunk>([\s\S]*?)<\/chunk>/g;
      let match;
      let hasChunks = false;

      while ((match = chunkRegex.exec(pageMarkdown)) !== null) {
        hasChunks = true;
        markdownChunks.push(match[1].trim());
      }

      // チャンクタグがない場合は全体を1つのチャンクとして追加
      if (!hasChunks && pageMarkdown.trim()) {
        markdownChunks.push(pageMarkdown.trim());
      }
    } catch (error) {
      console.error(`ページ ${i + 1} の処理中にエラー:`, error);
      // エラーがあってもプロセスを続行
    }
  }

  // 処理完了
  if (progressCallback) {
    progressCallback(100);
  }

  return markdownChunks;
}
