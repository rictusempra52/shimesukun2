// client.ts
// このファイルは、Dify API へのリクエストを行うための基本的な関数を定義しています。

"use server";

// Dify API キーを環境変数から取得
const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_ENDPOINT =
  process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";

/**　Dify API へのリクエストを行うための基本関数
 * @param path - APIパス
 * @param method - HTTPメソッド
 * @param body - リクエストボディ（オプション）
 * @returns APIレスポンス
 */
export async function difyRequest(endpoint: string, method: string, body?: any) {
  // APIキーが設定されていない場合はエラーをスロー
  if (!DIFY_API_KEY) throw new Error("Dify API キーが設定されていません");

  // APIエンドポイントのURL
  const url = `${DIFY_API_ENDPOINT}${path}`;

  /** リクエストヘッダー
   * @type {HeadersInit} - ヘッダーの初期値を設定するための型
   * @property {string} Authorization - Bearer トークン
   * @property {string} Content-Type - リクエストボディの形式
   * application/jsonは、リクエストボディがJSON形式であることを示す
   */
  const headers: HeadersInit = {
    Authorization: `Bearer ${DIFY_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // fetch: API を使用してリクエストを送信
    // method: HTTPメソッド（GET, POST, PUT, DELETEなど）
    // headers: リクエストヘッダー（AuthorizationとContent-Type）
    // body: リクエストボディ（JSON形式）
    // cache: キャッシュの設定（no-storeはキャッシュを使用しないことを示す）
    const response = await fetch(url, {
      method,
      headers,
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
    // 返り値をJSON形式で取得    src/lib/dify/
      ├── client.ts    // 現在のファイル（サーバーサイド基本関数）
      ├── api.ts       // 具体的なAPI呼び出し関数（現在のdify.tsの内容）
      └── browser.ts   // クライアントサイド用関数（use clientディレクティブ）
    return await response.json();
  } catch (error: any) {
    // エラーハンドリング: エラーメッセージをコンソールに出力し、エラーをスロー
    console.error("Dify API リクエストエラー:", error);
    throw new Error(`Dify API リクエスト失敗: ${error.message}`);
  }
}

/**
 * マルチパートフォームデータを送信するための関数
 * マルチパートフォームデータとは、ファイルやバイナリデータを含むHTTPリクエストの形式
 * 例えば、画像やドキュメントをアップロードする際に使用される
 * @param path - APIパス
 * @param formData - フォームデータ
 * @returns APIレスポンス
 */
export async function difyFormDataRequest(endpoint: string, formData: FormData) {
  //   APIキーが設定されていない場合はエラーをスロー
  if (!DIFY_API_KEY) throw new Error("Dify API キーが設定されていません");

  //   APIエンドポイントのURLを生成
  const url = `${DIFY_API_ENDPOINT}${path}`;
  // リクエストヘッダーを設定
  // headersは、HTTPリクエストのヘッダー情報を格納するオブジェクト
  // headersinitは、ヘッダーの初期値を設定するための型
  const headers: HeadersInit = {
    // Authorizationは、Bearerトークンを使用してAPIキーを認証するためのヘッダー
    Authorization: `Bearer ${DIFY_API_KEY}`,
  };

  try {
    // Fetch API を使用してリクエストを送信し、responseに格納
    // fetchは、HTTPリクエストを送信するための関数
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    });

    // レスポンスがHTML形式の場合、エラーメッセージを抽出
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
