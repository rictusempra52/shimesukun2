/**
 * Gemini APIを使用するためのユーティリティ関数
 * PDFのOCRやマークダウン変換などの処理をサポート
 * サーバーサイドAPIを経由してGemini APIを使用します
 */

/**
 * 画像からテキストを抽出してマークダウンに変換
 * サーバーサイドAPIを使用して処理します
 *
 * @param imageBuffer - 画像データのバッファ
 * @returns マークダウンフォーマットされたテキスト
 */
export async function extractTextAsMarkdown(
  imageBuffer: ArrayBuffer
): Promise<string> {
  try {
    // 画像データをBase64に変換（ブラウザ環境ではUint8Arrayを使用）
    const uint8Array = new Uint8Array(imageBuffer);
    const base64Image = btoa(
      Array.from(uint8Array)
        .map((b) => String.fromCharCode(b))
        .join("")
    );

    // サーバーサイドAPIを呼び出してGemini処理を実行
    const response = await fetch("/api/gemini/extract-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64: base64Image,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`APIエラー: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    return result.markdown;
  } catch (error: any) {
    console.error("Gemini APIエラー:", error);
    throw new Error(`Geminiによるテキスト抽出に失敗しました: ${error.message}`);
  }
}

/**
 * PDFの各ページをMarkdownに変換する
 * この関数はクライアントサイドでのみ使用可能です
 *
 * @param pdfPagesAsImages - PDFの各ページを画像として表現したバッファの配列
 * @param progressCallback - 処理の進捗を報告するコールバック関数（0-100）
 * @returns チャンク化されたMarkdownテキストの配列
 */
export async function convertPDFToMarkdown(
  pdfPagesAsImages: ArrayBuffer[],
  progressCallback?: (progress: number) => void
): Promise<string[]> {
  // サーバーサイドでの実行を防止
  if (typeof window === "undefined") {
    throw new Error("この関数はブラウザ環境でのみ使用できます");
  }

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

      // ページの画像からテキストを抽出（サーバーサイドAPIを使用）
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
