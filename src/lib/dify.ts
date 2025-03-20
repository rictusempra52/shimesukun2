// dify.ts
// Dify APIを利用してAI回答を生成するための関数を提供します。
// この関数は、Difyサービスを使用して質問に回答を生成します。

// 環境変数からAPIキーとエンドポイントを取得
const apiKey = process.env.DIFY_API_KEY;
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
      "Dify APIキーが設定されていません。環境変数を確認してください。"
    );
  }

  try {
    // APIリクエストの準備
    const endpoint = `${apiEndpoint}/chat-messages`;

    // リクエストボディの構築
    const requestBody: any = {
      query: question,
      response_mode: "blocking", // 同期モード
      conversation_id: "", // 新しい会話として扱う場合は空文字
      user: "end-user", // ユーザー識別子
      inputs: {}, // 追加の入力パラメータ
    };

    // 文書コンテキストがある場合は inputs に追加
    if (documentContext) {
      requestBody.inputs.context = documentContext;
    }

    // チャット履歴がある場合は追加
    if (chatHistory && chatHistory.length > 0) {
      requestBody.conversation_id = "existing-conversation-id"; // 実際の会話IDを使用
    }

    // APIへのリクエスト送信
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // レスポンスの処理
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Dify API エラー: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();

    // レスポンスを整形して返す
    return {
      answer: data.answer || data.text, // 回答テキスト
      sources: data.sources || [], // 情報ソース
      relatedInfo: extractRelatedInfo(data), // 関連情報の抽出
      examples: extractExamples(data), // 他マンションの事例抽出
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
  // Difyのレスポンス構造に合わせて適宜調整
  if (response.additional_reply && response.additional_reply.related_info) {
    return response.additional_reply.related_info;
  }
  return "関連情報はありません。";
}

/**
 * Difyのレスポンスから他マンションの事例を抽出
 */
function extractExamples(response: any): string {
  // Difyのレスポンス構造に合わせて適宜調整
  if (response.additional_reply && response.additional_reply.examples) {
    return response.additional_reply.examples;
  }
  return "類似事例はありません。";
}
