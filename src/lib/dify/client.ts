"use server";

/**
 * Dify API クライアント
 * API キーはサーバーサイドでのみ使用し、フロントエンドには公開しない
 */

const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_ENDPOINT =
  process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";

/**
 * Dify API へのリクエストを行うための基本関数
 * @param path - APIパス
 * @param method - HTTPメソッド
 * @param body - リクエストボディ（オプション）
 * @returns APIレスポンス
 */
export async function difyRequest(path: string, method: string, body?: any) {
  // APIキーが設定されていない場合はエラーをスロー
  if (!DIFY_API_KEY) {
    throw new Error("Dify API キーが設定されていません");
  }

  /**
   * Dify API へのリクエストを行うための基本関数
   * @param path - APIパス
   */
  const url = `${DIFY_API_ENDPOINT}${path}`;
  /**
   * リクエストヘッダー
   * @type {HeadersInit}
   * @defaults {Object}
   * @property {string} Authorization - Bearer トークン
   * @property {string} Content-Type - リクエストボディの形式
   */
  const headers: HeadersInit = {
    Authorization: `Bearer ${DIFY_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    // HTML形式のエラーレスポンスをチェック
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const htmlContent = await response.text();
      const errorMessage = htmlContent.includes("<title>")
        ? htmlContent.match(/<title>(.*?)<\/title>/)?.[1] ||
          "HTMLエラーページが返されました"
        : "HTMLエラーページが返されました";
      throw new Error(
        `Dify API は有効なJSONではなくHTMLを返しました: ${errorMessage}`
      );
    }

    if (!response.ok) {
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || "不明なエラー";
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`Dify API エラー (${response.status}): ${errorMessage}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Dify API リクエストエラー:", error);
    throw new Error(`Dify API リクエスト失敗: ${error.message}`);
  }
}

/**
 * マルチパートフォームデータを送信するための関数
 * @param path - APIパス
 * @param formData - フォームデータ
 * @returns APIレスポンス
 */
export async function difyFormDataRequest(path: string, formData: FormData) {
  if (!DIFY_API_KEY) {
    throw new Error("Dify API キーが設定されていません");
  }

  const url = `${DIFY_API_ENDPOINT}${path}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${DIFY_API_KEY}`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || "不明なエラー";
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`Dify API エラー (${response.status}): ${errorMessage}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Dify API フォームデータリクエストエラー:", error);
    throw new Error(`Dify API リクエスト失敗: ${error.message}`);
  }
}
