/**
 * PDFファイルを処理するためのユーティリティ関数群
 * PDFを画像に変換したり、ページを処理するための機能を提供します
 */

import { PDFDocument } from "pdf-lib";

// pdfjs-distはブラウザ環境のみでインポートするために、直接インポートしない
// import * as pdfjs from "pdfjs-dist";
import { convertPDFToMarkdown } from "./gemini";

// 動的にpdfjs-distをロードする関数
const loadPdfjsLib = async () => {
  if (typeof window === "undefined") {
    throw new Error("PDF.jsはブラウザ環境でのみ使用できます");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  return pdfjs;
};

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

    // PDFを画像に変換（進捗50%までの処理）
    const pageImages = await convertPDFToImages(pdfBuffer, (imageProgress) => {
      // 画像変換は全体の50%とする
      if (progressCallback) {
        progressCallback(5 + imageProgress / 2);
      }
    });

    console.log(`${pageImages.length}ページの画像化が完了しました`);

    // 進捗を55%に更新
    if (progressCallback) {
      progressCallback(55);
    }

    // 画像をMarkdownに変換（残りの45%）
    console.log("Gemini APIを使用してマークダウンに変換中...");
    const markdownChunks = await convertPDFToMarkdown(
      pageImages,
      (geminiProgress) => {
        // Gemini処理は全体の45%とする
        if (progressCallback) {
          progressCallback(55 + geminiProgress * 0.45);
        }
      }
    );

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
