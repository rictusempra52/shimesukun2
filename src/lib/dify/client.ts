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
   * @property {string} Authorization - Bearer トークン
   * @property {string} Content-Type - リクエストボディの形式
   */
  const headers: HeadersInit = {
    Authorization: `Bearer ${DIFY_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // Fetch API を使用してリクエストを送信
    const response = await fetch(url, {
      // method: HTTPメソッド（GET, POST, PUT, DELETEなど）
      method,
      // headers: リクエストヘッダー（AuthorizationとContent-Type）
      headers,
      // body: リクエストボディ（JSON形式）
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    // HTML形式のエラーレスポンスをチェック

    // content-type ヘッダーを取得
    const contentType = response.headers.get("content-type");
    // レスポンスヘッダーからContent-Typeを取得
    if (contentType && contentType.includes("text/html")) {
      // HTML形式のレスポンスをテキストとして取得
      // awaitがあると、非同期処理が完了するまで待機する
      // 非同期処理とは、時間がかかる処理のこと
      // 例えば、APIからのレスポンスを待つことなど
      const htmlContent = await response.text();
      // HTML形式のエラーレスポンスの場合、エラーメッセージを抽出
      const errorMessage = htmlContent.includes("<title>")
        ? // 正規表現を使用して、<title>タグの内容を抽出
          // もし<title>タグが存在する場合、その内容を取得
          htmlContent.match(/<title>(.*?)<\/title>/)?.[1] ||
          "HTMLエラーページが返されました"
        : // もし<title>タグが存在しない場合、そのままの内容を取得
          "HTMLエラーページが返されました";
      throw new Error(
        `Dify API は有効なJSONではなくHTMLを返しました: ${errorMessage}`
      );
    }

    // レスポンスがOKでない場合、エラーメッセージを取得
    // response.okは、HTTPレスポンスのステータスコードが200-299の範囲内であるかどうかを示すプロパティ
    // 200-299は成功を示すステータスコード
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
