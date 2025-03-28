"use server"; // サーバーサイド専用コードと明示

// 環境変数から直接APIキーとエンドポイントを取得
const apiKey = process.env.DIFY_API_KEY || "";
const apiEndpoint = process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";

/**
 * Difyのチャットコンプリーションエンドポイントにリクエストを送信
 * @param question ユーザーからの質問
 * @param documentContext 関連文書のコンテキスト（オプション）
 * @param chatHistory 過去のチャット履歴（オプション）
 * @returns AIからの回答
 */
export async function askDifyBuildingManagementQuestion(
  question: string,
  documentContext?: string,
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>
) {
  if (!apiKey) {
    throw new Error(
      `Dify APIキーが設定されていません。環境変数を確認してください。`
    );
  }

  try {
    const endpoint = `${apiEndpoint}/chat-messages`;

    const requestBody: any = {
      query: question,
      response_mode: "blocking",
      conversation_id: "",
      user: "end-user",
      inputs: {},
    };

    if (documentContext) {
      requestBody.inputs.context = documentContext;
    }

    if (chatHistory && chatHistory.length > 0) {
      requestBody.conversation_id = "existing-conversation-id";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Dify API エラー: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();

    return {
      answer: data.answer || data.text,
      sources: data.sources || [],
      relatedInfo: extractRelatedInfo(data),
      examples: extractExamples(data),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Dify API呼び出しエラー:", error);
    throw new Error(
      "AI回答の生成に失敗しました。しばらく経ってから再度お試しください。"
    );
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
