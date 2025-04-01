// api-service.ts
// このファイルは、Dify APIへのリクエストを送信するための基本的な関数を定義しています

"use server";

const DIFY_API_ENDPOINT =
  process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY || "";

/**
 * Dify APIへのリクエストを送信する基本関数
 * @param endpoint APIエンドポイント
 * @param method HTTPメソッド
 * @param body リクエストボディ（オプション）
 * @returns APIレスポンス
 */
export async function difyRequest(
  endpoint: string,
  method: string,
  body?: any
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DIFY_API_KEY}`,
  };

  // リクエスト前にデバッグ情報を出力
  console.log(`Dify APIリクエスト: ${DIFY_API_ENDPOINT}${endpoint}`);

  try {
    const response = await fetch(`${DIFY_API_ENDPOINT}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // レスポンスの内容に応じた処理
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        console.error("Dify APIエラーレスポンス:", error);
        throw new Error(
          error.error ||
            error.message ||
            `APIエラー: ${response.status} ${response.statusText}`
        );
      } else {
        // JSONではないレスポンス（HTMLなど）の場合
        const text = await response.text();
        console.error("Dify APIエラーテキスト:", text.substring(0, 200));
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    // ネットワークエラーなど
    console.error("Dify API呼び出し例外:", error);
    if (error instanceof Error) {
      throw error; // すでにErrorオブジェクトなのでそのままスロー
    } else {
      throw new Error("不明なAPIエラーが発生しました");
    }
  }
}

/**
 * Dify APIへのFormDataリクエストを送信する関数
 * @param endpoint APIエンドポイント
 * @param method HTTPメソッド
 * @param formData フォームデータ
 * @returns APIレスポンス
 */
export async function difyFormDataRequest(
  endpoint: string,
  method: string,
  formData: FormData
) {
  const headers = {
    Authorization: `Bearer ${DIFY_API_KEY}`,
  };

  const response = await fetch(`${DIFY_API_ENDPOINT}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "APIリクエストに失敗しました");
  }

  return response.json();
}
