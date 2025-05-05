/**
 * PDFファイルを処理するためのユーティリティ関数群
 * PDFを画像に変換したり、ページを処理するための機能を提供します
 */

import { PDFDocument } from "pdf-lib";
import { convertPDFToMarkdown } from "./gemini";

// PDF.jsを動的にロードし、ワーカーを設定する関数
const loadPdfjsLib = async () => {
  if (typeof window === "undefined") {
    throw new Error("PDF.jsはブラウザ環境でのみ使用できます");
  }

  try {
    // PDF.jsライブラリを動的にインポート
    const pdfjs = await import("pdfjs-dist");

    // npm パッケージからワーカーを直接読み込む
    if (typeof window !== "undefined" && "Worker" in window) {
      const workerUrl = new URL(
        "pdfjs-dist/build/pdf.worker.min.js",
        import.meta.url
      );
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.toString();
    }

    return pdfjs;
  } catch (error) {
    console.error("PDF.jsのロード中にエラーが発生しました:", error);
    throw new Error(`PDF.jsのロードに失敗しました: ${error}`);
  }
};

/**
 * PDFファイルからテキストを直接抽出します
 * この関数はクライアントサイドでのみ使用可能です
 *
 * @param pdfBuffer - PDFファイルのバッファ
 * @param progressCallback - 進捗状況を報告するコールバック関数（0-100）
 * @returns ページごとのテキスト配列
 */
export async function extractTextFromPdf(
  pdfBuffer: ArrayBuffer,
  progressCallback?: (progress: number) => void
): Promise<string[]> {
  // サーバーサイドではエラーをスローする
  if (typeof window === "undefined") {
    throw new Error("この関数はブラウザ環境でのみ使用できます");
  }

  try {
    // 進捗表示の初期化
    if (progressCallback) {
      progressCallback(0);
    }

    // PDF.jsを動的にロード
    const pdfjs = await loadPdfjsLib();
    console.log("PDF.jsを正常にロードしました。テキスト抽出を開始します");

    // PDF.jsでPDFをロード
    const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    // 各ページからテキストを抽出
    for (let i = 1; i <= numPages; i++) {
      try {
        // 進捗状況の更新
        if (progressCallback) {
          progressCallback(Math.floor((i / numPages) * 90)); // テキスト抽出は進捗の90%まで
        }

        // ページを取得
        const page = await pdf.getPage(i);

        // テキスト内容を抽出
        const textContent = await page.getTextContent();

        // テキスト要素を連結
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        pageTexts.push(pageText);

        console.log(
          `ページ ${i}/${numPages} のテキストを抽出しました (${pageText.length} 文字)`
        );
      } catch (error) {
        console.error(`ページ ${i} のテキスト抽出中にエラー:`, error);
        pageTexts.push(""); // エラーの場合は空の文字列を追加
      }
    }

    // 完了
    if (progressCallback) {
      progressCallback(90); // テキスト抽出完了
    }

    return pageTexts;
  } catch (error) {
    console.error("PDFからのテキスト抽出中にエラーが発生しました:", error);
    throw new Error(`PDFからテキストを抽出できませんでした: ${error}`);
  }
}

/**
 * PDFからテキストが抽出可能かどうかを判定します
 *
 * @param pageTexts - 抽出したページテキストの配列
 * @param minTextLength - テキスト埋め込みと判断する最小文字数
 * @returns テキスト抽出可能かどうか
 */
export function isPdfWithExtractableText(
  pageTexts: string[],
  minTextLength: number = 100
): boolean {
  // 各ページに一定量のテキストが含まれているかをチェック
  const hasEnoughText = pageTexts.some((text) => text.length >= minTextLength);

  // テキストが適切に抽出できたかどうかを判定
  // (例: 意味のある単語が含まれているか、記号だけでないかなど)
  const hasQualityText = pageTexts.some((text) => {
    // 日本語の文字を含むかチェック（ひらがな、カタカナ、漢字）
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);

    // 英数字を含むかチェック
    const hasAlphanumeric = /[a-zA-Z0-9]/.test(text);

    return hasJapanese || hasAlphanumeric;
  });

  return hasEnoughText && hasQualityText;
}

/**
 * 抽出したテキストをマークダウン形式にフォーマットします
 *
 * @param pageTexts - ページごとのテキスト配列
 * @param progressCallback - 進捗状況を報告するコールバック関数
 * @returns マークダウンチャンクの配列
 */
export async function formatTextToMarkdown(
  pageTexts: string[],
  progressCallback?: (progress: number) => void
): Promise<string[]> {
  // マークダウンチャンクを格納する配列
  const markdownChunks: string[] = [];

  // テキストをチャンクに分割
  for (let i = 0; i < pageTexts.length; i++) {
    const pageText = pageTexts[i];

    // 進捗報告
    if (progressCallback) {
      progressCallback(90 + Math.floor((i / pageTexts.length) * 10)); // 残りの10%を使用
    }

    if (!pageText.trim()) continue; // 空ページをスキップ

    // テキストを適切なサイズのチャンクに分割
    const chunks = splitTextIntoChunks(pageText);

    // 分割したチャンクをマークダウンチャンク配列に追加
    markdownChunks.push(...chunks);
  }

  // 完了
  if (progressCallback) {
    progressCallback(100);
  }

  return markdownChunks;
}

/**
 * テキストを適切なサイズのチャンクに分割します
 *
 * @param text - 分割するテキスト
 * @param maxChunkSize - チャンクの最大サイズ（文字数）
 * @returns 分割されたチャンクの配列
 */
function splitTextIntoChunks(
  text: string,
  maxChunkSize: number = 800
): string[] {
  const chunks: string[] = [];

  // テキストが短い場合はそのまま返す
  if (text.length <= maxChunkSize) {
    return [text];
  }

  // 段落で分割する
  const paragraphs = text.split(/\n\s*\n/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // 段落が単体で最大サイズを超える場合は、文で分割する
    if (paragraph.length > maxChunkSize) {
      const sentences = paragraph.split(/。|\.|\!|\?/g);

      for (const sentence of sentences) {
        if (sentence.trim() === "") continue;

        if (currentChunk.length + sentence.length > maxChunkSize) {
          // 現在のチャンクが最大サイズに達した場合、保存して新しいチャンクを開始
          if (currentChunk.trim() !== "") {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence + "。";
        } else {
          // まだ余裕がある場合は、現在のチャンクに追加
          currentChunk += sentence + "。";
        }
      }
    } else {
      // 段落が小さい場合、1つのチャンクに収まるかチェック
      if (currentChunk.length + paragraph.length > maxChunkSize) {
        // 現在のチャンクが最大サイズに達した場合、保存して新しいチャンクを開始
        if (currentChunk.trim() !== "") {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph + "\n\n";
      } else {
        // まだ余裕がある場合は、現在のチャンクに追加
        currentChunk += paragraph + "\n\n";
      }
    }
  }

  // 最後のチャンクを追加
  if (currentChunk.trim() !== "") {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * PDFファイルから全ページの画像を生成
 * この関数はクライアントサイドでのみ使用可能です
 *
 * @param pdfBuffer - PDFファイルのバッファ
 * @param progressCallback - 進捗状況を報告するコールバック関数（0-100）
 * @returns 各ページの画像バッファの配列
 */
export async function convertPDFToImages(
  pdfBuffer: ArrayBuffer,
  progressCallback?: (progress: number) => void
): Promise<ArrayBuffer[]> {
  // サーバーサイドではエラーをスローする
  if (typeof window === "undefined") {
    throw new Error("この関数はブラウザ環境でのみ使用できます");
  }

  try {
    // PDFドキュメントをロード
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageImages: ArrayBuffer[] = [];

    const pageCount = pdfDoc.getPageCount();
    console.log(`PDFは ${pageCount} ページあります`);

    // 進捗表示の初期化
    if (progressCallback) {
      progressCallback(0);
    }

    // PDF.jsを動的にロード
    const pdfjs = await loadPdfjsLib();

    console.log(
      "PDF.jsを正常にロードしました。ワーカー設定:",
      pdfjs.GlobalWorkerOptions.workerSrc
    );

    // PDF.jsでPDFをロード
    const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    // 各ページを処理
    for (let i = 0; i < pageCount; i++) {
      try {
        const pageNum = i + 1;
        console.log(`ページ ${pageNum}/${pageCount} を画像化中...`);

        // 進捗状況の更新（画像変換部分は全体の50%と想定）
        if (progressCallback) {
          progressCallback(Math.floor((i / pageCount) * 50));
        }

        // PDFページを取得
        const page = await pdf.getPage(pageNum);

        // ページのビューポートを設定（解像度を調整）
        const viewport = page.getViewport({ scale: 1.5 }); // スケールを調整して解像度を上げる

        // キャンバスを作成
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvasコンテキストを取得できませんでした");
        }

        // キャンバスサイズをビューポートに合わせる
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // PDFページをキャンバスにレンダリング
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // キャンバスをPNG画像に変換
        const imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else throw new Error("Canvasを画像に変換できませんでした");
            },
            "image/png",
            0.95
          ); // 高品質でエクスポート
        });

        // BlobをArrayBufferに変換
        const imageArrayBuffer = await imageBlob.arrayBuffer();
        pageImages.push(imageArrayBuffer);
      } catch (error) {
        console.error(`ページ ${i + 1} の処理中にエラー:`, error);
      }
    }

    // 画像変換が完了したら50%まで進捗を更新
    if (progressCallback) {
      progressCallback(50);
    }

    return pageImages;
  } catch (error) {
    console.error("PDFの処理中にエラーが発生しました:", error);
    throw new Error(`PDFを画像に変換できませんでした: ${error}`);
  }
}

/**
 * PDFをマークダウンに変換するためのワークフロー全体を管理
 * この関数はクライアントサイドでのみ使用可能です
 *
 * @param fileOrBuffer - PDFファイルまたはバッファ
 * @param progressCallback - 進捗状況を報告するコールバック関数（0-100）
 * @returns マークダウンチャンクの配列
 */
export async function processPDFToMarkdown(
  fileOrBuffer: File | ArrayBuffer,
  progressCallback?: (progress: number) => void
): Promise<string[]> {
  // サーバーサイドではエラーをスローする
  if (typeof window === "undefined") {
    throw new Error("この関数はブラウザ環境でのみ使用できます");
  }

  try {
    // ファイルかバッファかを判断し、バッファに統一
    let pdfBuffer: ArrayBuffer;

    if (fileOrBuffer instanceof File) {
      // Fileオブジェクトを渡された場合はArrayBufferに変換
      pdfBuffer = await fileOrBuffer.arrayBuffer();
    } else {
      // すでにArrayBufferの場合はそのまま使用
      pdfBuffer = fileOrBuffer;
    }

    // PDFを読み込み、ページ数を取得
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    // 進捗報告の初期化
    if (progressCallback) {
      progressCallback(5);
    }

    console.log("PDFからテキストを抽出を試みます...");
    // まず、PDFからテキストを直接抽出を試みる
    const extractedTexts = await extractTextFromPdf(pdfBuffer, (progress) => {
      // テキスト抽出は進捗の50%までを使用
      if (progressCallback) {
        progressCallback(5 + progress / 2);
      }
    });

    // テキスト抽出の結果を評価
    const isTextPdf = isPdfWithExtractableText(extractedTexts);
    console.log(
      `テキスト抽出結果: ${isTextPdf ? "成功" : "不十分"} (${extractedTexts
        .map((t) => t.length)
        .join(", ")} 文字)`
    );

    let markdownChunks: string[] = [];

    if (isTextPdf) {
      // テキストが埋め込まれているPDFの場合、直接テキストを処理
      console.log(
        "テキストが埋め込まれているPDFを検出しました。テキストを直接処理します"
      );

      // 抽出したテキストをマークダウンに変換
      markdownChunks = await formatTextToMarkdown(
        extractedTexts,
        (formatProgress) => {
          // フォーマット処理は残りの進捗を使用
          if (progressCallback) {
            progressCallback(55 + formatProgress * 0.45);
          }
        }
      );
    } else {
      // テキスト抽出が不十分な場合、画像変換 + OCRの従来の方法を使用
      console.log("テキスト抽出が不十分です。画像変換とOCRを使用します");

      // PDFを画像に変換（進捗50%までの処理）
      const pageImages = await convertPDFToImages(
        pdfBuffer,
        (imageProgress) => {
          // 画像変換は全体の50%とする
          if (progressCallback) {
            progressCallback(5 + imageProgress / 2);
          }
        }
      );

      console.log(`${pageImages.length}ページの画像化が完了しました`);

      // 進捗を55%に更新
      if (progressCallback) {
        progressCallback(55);
      }

      // 画像をMarkdownに変換（残りの45%）
      console.log("Gemini APIを使用してマークダウンに変換中...");
      markdownChunks = await convertPDFToMarkdown(
        pageImages,
        (geminiProgress) => {
          // Gemini処理は全体の45%とする
          if (progressCallback) {
            progressCallback(55 + geminiProgress * 0.45);
          }
        }
      );
    }

    // 完了
    if (progressCallback) {
      progressCallback(100);
    }

    return markdownChunks;
  } catch (error) {
    console.error("Markdownへの変換中にエラーが発生しました:", error);
    throw error;
  }
}
