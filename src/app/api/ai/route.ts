import { NextRequest, NextResponse } from "next/server";
import { askDifyBuildingManagementQuestion } from "@/lib/dify";

/**
 * APIの最大実行時間を設定
 * デフォルトは60秒
 */
export const config = {
  maxDuration: 60,
};

/**
 * APIのタイムアウト制御のためのabortControllerを生成する関数
 * @param timeoutMs タイムアウト時間（ミリ秒）
 */
function createTimeoutController(timeoutMs: number = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clearTimeout: () => clearTimeout(timeoutId),
  };
}

/**
 * レスポンスを検証し、安全に処理する関数
 */
function validateResponse(response: any): any {
  // レスポンスのサイズをログ出力（デバッグ用）
  const responseSize = JSON.stringify(response).length;
  console.log(`Difyレスポンスサイズ: ${responseSize} bytes`);

  // レスポンスが大きすぎる場合は簡略化する
  if (responseSize > 50000) {
    console.warn("レスポンスが大きすぎるため、簡略化します");
    return {
      回答要点:
        response.回答要点 || "回答サイズが大きすぎるため、簡略化されました。",
      法的実務的根拠: response.法的実務的根拠 || "省略されました",
      // 他の重要なフィールドも保持
    };
  }

  return response;
}

/**
 * AIの質問応答APIエンドポイント
 * クライアントからの質問をサーバーサイドのDify関数に転送
 */
export async function POST(req: NextRequest) {
  const timeoutController = createTimeoutController(45000); // 45秒のタイムアウト

  try {
    // リクエストボディから質問を取得
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "質問が提供されていないか、無効な形式です" },
        { status: 400 }
      );
    }

    console.log(
      `AI API: 質問を受信 (${query.length}文字): "${query.substring(0, 30)}..."`
    );

    // Dify APIにリクエストを送信
    const response = await askDifyBuildingManagementQuestion(query);

    // タイムアウトを解除
    timeoutController.clearTimeout();

    // レスポンスを検証して返却
    const validatedResponse = validateResponse(response);

    return NextResponse.json(validatedResponse, {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    // タイムアウトを解除
    timeoutController.clearTimeout();

    // タイムアウトエラーの特別処理
    if (error.name === "AbortError") {
      console.error("API タイムアウト: リクエストがタイムアウトしました");
      return NextResponse.json(
        {
          error:
            "リクエストがタイムアウトしました。質問を短くするか、後でもう一度お試しください。",
        },
        { status: 504 }
      );
    }

    // 一般的なエラーハンドリング
    console.error("AI API エラー:", error);
    return NextResponse.json(
      { error: error.message || "AIリクエストに失敗しました" },
      { status: error.status || 500 }
    );
  }
}
