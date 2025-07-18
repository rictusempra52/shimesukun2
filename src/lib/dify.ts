"use server"; // サーバーサイド専用コードと明示

// 環境変数から直接APIキーとエンドポイントを取得
const apiKey = process.env.DIFY_API_KEY || "";
const apiEndpoint = process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1";

/**
 * Difyのチャットコンプリーションエンドポイントにリクエストを送信
 * @param question ユーザーからの質問
 * @param conversationId 過去のチャット履歴のID（オプション）
 * @returns AIからの回答
 */
export async function askDifyBuildingManagementQuestion(
  question: string,
  conversationId?: string
) {
  // 質問内容が空の場合はエラーをスロー
  if (!question || question.trim() === "") {
    throw new Error("質問内容を入力してください。");
  }

  try {
    // APIキーが設定されていない場合はエラーをスロー
    if (!apiKey) {
      throw new Error("Dify API キーが設定されていません");
    }

    // リクエストペイロードに query パラメータを追加
    const payload = {
      inputs: { question: question.trim() },
      query: question.trim(), // 必須パラメータとして追加
      response_mode: "blocking", // streamingではなくblockingに変更
      conversation_id: conversationId,
      user: "user-001",
    };

    // Dify APIのドキュメントに基づいて正しいエンドポイントを使用
    // ストリーミングモードの場合は /chat-messages、ブロッキングモードの場合は /completion-messages が一般的
    const url = `${apiEndpoint}/chat-messages`;
    console.log(`Dify API リクエスト送信先: ${url}`);

    // タイムアウト付きのフェッチを実装
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40秒タイムアウト

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // タイムアウトクリア
    clearTimeout(timeoutId);

    // デバッグのためのログ追加
    console.log(
      `Dify API ステータス: ${response.status} ${response.statusText}`
    );

    // レスポンスのContent-Typeをチェック
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      // HTMLが返ってきた場合のエラー処理
      const htmlContent = await response.text();
      console.error(
        "Dify API から返されたHTMLレスポンス:",
        htmlContent.substring(0, 500)
      );
      // エラーページのタイトルを取得
      const errorMessage = htmlContent.includes("<title>")
        ? // タイトルタグが存在する場合はタイトルを取得
          htmlContent.match(/<title>(.*?)<\/title>/)?.[1] ||
          "HTMLエラーページが返されました"
        : // タイトルタグが存在しない場合はエラーメッセージ全体を取得
          "HTMLエラーページが返されました";
      throw new Error(
        `Dify API は有効なJSONではなくHTMLを返しました: ${errorMessage}`
      );
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(
          `Dify API エラー: ${
            errorData.message || errorData.error || "不明なエラー"
          }`
        );
      } catch (jsonError) {
        // JSONパースに失敗した場合
        const text = await response.text();
        throw new Error(
          `Dify API エラー (${response.status}): ${text.substring(0, 100)}...`
        );
      }
    }

    // 正常なJSONレスポンス
    const jsonResponse = await response.json();

    // 簡潔なレスポンスログを出力
    console.log(
      "Dify APIレスポンス受信:",
      jsonResponse.answer
        ? `(answer field: ${
            typeof jsonResponse.answer === "string"
              ? jsonResponse.answer.substring(0, 50) + "..."
              : "(object)"
          })`
        : "(no answer field)"
    );

    // 修正: answerフィールドが存在し、文字列の場合はそれをパースする
    if (jsonResponse.answer && typeof jsonResponse.answer === "string") {
      try {
        // 文字列からJSONオブジェクトとしてパース
        return JSON.parse(jsonResponse.answer);
      } catch (e) {
        console.log("回答の文字列パースに失敗:", e);
        // パース失敗時はテキストとして返す
        return { 回答要点: jsonResponse.answer };
      }
    }

    // answer.messageプロパティに回答がある場合
    if (jsonResponse.answer && jsonResponse.answer.message) {
      try {
        // 文字列からJSONオブジェクトとしてパース
        return JSON.parse(jsonResponse.answer.message);
      } catch (e) {
        console.log("回答のmessageパースに失敗:", e);
        // テキストとして返す
        return { 回答要点: jsonResponse.answer.message };
      }
    }

    // dataプロパティに回答がある場合
    if (jsonResponse.data) {
      return jsonResponse;
    }

    // 既にパースされた回答オブジェクトの場合
    if (jsonResponse.回答要点) {
      return jsonResponse;
    }

    // それ以外の構造の場合は元のレスポンスを返す
    return jsonResponse;
  } catch (error: any) {
    // AbortController によるタイムアウトエラーの特別処理
    if (error.name === "AbortError") {
      throw new Error(
        "Dify APIリクエストがタイムアウトしました。後でもう一度試してください。"
      );
    }

    console.error("Dify API呼び出しエラー:", error);

    const errorMessage =
      error instanceof Error
        ? `AI回答の生成に失敗しました: ${error.message}`
        : "AI回答の生成に失敗しました。しばらく経ってから再度お試しください。";

    throw new Error(errorMessage);
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
