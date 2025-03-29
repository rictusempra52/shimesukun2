"use server"; // サーバーサイド専用コードと明示

// 環境変数から直接APIキーとエンドポイントを取得
const apiKey = process.env.DIFY_API_KEY || "";
const apiEndpoint = process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";

/**
 * Dify APIを使って建物管理の質問に回答を得る
 */
export async function askDifyBuildingManagementQuestion(
  question: string,
  conversationId?: string
) {
  if (!question || question.trim() === "") {
    throw new Error("質問内容を入力してください。");
  }

  try {
    const DIFY_API_KEY = process.env.DIFY_API_KEY;
    const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    if (!DIFY_API_KEY) {
      throw new Error("Dify API キーが設定されていません");
    }

    const payload = {
      inputs: { question: question.trim() },
      query: question.trim(),
      response_mode: "blocking",
      conversation_id: conversationId,
      user: "user-001",
    };

    const endpoint = `${DIFY_API_URL}/chat-messages`;
    console.log(`Dify API リクエスト送信先: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // レスポンスタイプを確認
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      // エラーレスポンスの処理
      let errorMessage = `Dify API エラー: ${response.status} ${response.statusText}`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = `${errorMessage} - ${errorText.substring(0, 100)}...`;
        }
      } catch (e) {
        console.error("エラーレスポンスの解析に失敗:", e);
      }

      throw new Error(errorMessage);
    }

    // 正常レスポンスの処理
    if (contentType?.includes("application/json")) {
      const jsonResponse = await response.json();
      return {
        answer:
          jsonResponse.answer ||
          jsonResponse.text ||
          jsonResponse.message ||
          "回答を生成できませんでした",
        conversationId: jsonResponse.conversation_id || conversationId,
      };
    } else {
      // JSONでない場合の処理
      const textResponse = await response.text();
      console.warn(
        "Dify APIから予期しない形式のレスポンスを受信:",
        textResponse.substring(0, 200)
      );
      throw new Error("APIから予期しない応答形式を受信しました");
    }
  } catch (error: any) {
    console.error("Dify APIリクエストエラー:", error);
    throw error;
  }
}

/**
 * Difyのレスポンスから関連情報を抽出
 */
function extractRelatedInfo(response: any): string {
  if (response.additional_reply && response.additional_reply.related_info) {
    return response.additional_reply.related_info;
  }
  return "関連情報はありません。";
}

/**
 * Difyのレスポンスから他マンションの事例を抽出
 */
function extractExamples(response: any): string {
  if (response.additional_reply && response.additional_reply.examples) {
    return response.additional_reply.examples;
  }
  return "類似事例はありません。";
}

/**
 * Dify APIを呼び出す関数
 * @param {string} query - 質問内容
 * @returns {Promise<any>} - APIのレスポンス
 */
export async function fetchDifyResponse(query: string): Promise<any> {
  if (!apiKey) {
    throw new Error("Dify APIキーが設定されていません");
  }

  const response = await fetch(`${apiEndpoint}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Dify APIリクエストに失敗しました");
  }

  return response.json();
}
