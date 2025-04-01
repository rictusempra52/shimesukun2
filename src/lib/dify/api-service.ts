// api-service.ts
// このファイルは、Dify APIへのリクエストを送信するための基本的な関数を定義しています

"use server";

const DIFY_API_ENDPOINT =
  process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY || "";
const DIFY_KNOWLEDGE_API_KEY = process.env.DIFY_KNOWLEDGE_API_KEY || "";

/**
 * Dify APIへの基本的なリクエストを送信する内部関数
 * @param endpoint APIエンドポイント
 * @param method HTTPメソッド
 * @param apiKey 使用するAPIキー
 * @param body リクエストボディ（オプション）
 * @returns APIレスポンス
 */
async function sendDifyRequest(
  endpoint: string,
  method: string,
  apiKey: string,
  body?: any
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
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
        throw new Error(
          error.error ||
            error.message ||
            `APIエラー: ${response.status} ${response.statusText}`
        );
      } else {
        const text = await response.text();
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    // ネットワークエラーなど
    console.error("Dify API呼び出し例外:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("不明なAPIエラーが発生しました");
    }
  }
}

/**
 * Dify アプリケーションAPIへのリクエストを送信する関数
 */
export async function difyAppRequest(
  endpoint: string,
  method: string,
  body?: any
) {
  return sendDifyRequest(endpoint, method, DIFY_API_KEY, body);
}

/**
 * Dify ナレッジベースAPIへのリクエストを送信する関数
 */
export async function difyKnowledgeRequest(
  endpoint: string,
  method: string,
  body?: any
) {
  return sendDifyRequest(endpoint, method, DIFY_KNOWLEDGE_API_KEY, body);
}

/**
 * Dify APIへのFormDataリクエストを送信する内部関数
 */
async function sendDifyFormDataRequest(
  endpoint: string,
  method: string,
  apiKey: string,
  formData: FormData
) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    const response = await fetch(`${DIFY_API_ENDPOINT}${endpoint}`, {
      method,
      headers,
      body: formData,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "APIリクエストに失敗しました"
        );
      } else {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    console.error("Dify API FormData呼び出し例外:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("不明なAPIリクエストエラーが発生しました");
    }
  }
}

/**
 * Dify アプリケーションAPIへのFormDataリクエストを送信する関数
 */
export async function difyAppFormDataRequest(
  endpoint: string,
  method: string,
  formData: FormData
) {
  return sendDifyFormDataRequest(endpoint, method, DIFY_API_KEY, formData);
}

/**
 * Dify ナレッジベースAPIへのFormDataリクエストを送信する関数
 */
export async function difyKnowledgeFormDataRequest(
  endpoint: string,
  method: string,
  formData: FormData
) {
  return sendDifyFormDataRequest(
    endpoint,
    method,
    DIFY_KNOWLEDGE_API_KEY,
    formData
  );
}

/**
 * @deprecated 代わりにdifyAppRequestまたはdifyKnowledgeRequestを使用してください
 */
export async function difyRequest(
  endpoint: string,
  method: string,
  body?: any
) {
  console.warn(
    "difyRequest関数は非推奨です。明示的なdifyAppRequestまたはdifyKnowledgeRequestを使用してください"
  );
  if (endpoint.includes("/datasets")) {
    return difyKnowledgeRequest(endpoint, method, body);
  }
  return difyAppRequest(endpoint, method, body);
}
