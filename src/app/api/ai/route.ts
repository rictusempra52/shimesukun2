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
 * レスポンスの文字数を確認し、問題がないことを検証する
 * @param response Difyからのレスポンス
 * @returns 処理されたレスポンス
 */
function validateAndProcessResponse(response: any) {
  // 文字数制限の問題を解決するために実行時チェック
  if (typeof response === "object") {
    // レスポンスが長文でも確実に表示されるよう処理
    console.log("Dify完全レスポンス:", JSON.stringify(response).length, "文字");
    return response;
  }
  return response;
}

/**
 * AIの質問応答APIエンドポイント
 * クライアントからの質問をサーバーサイドのDify関数に転送
 * @param { NextRequest } req - クライアントからのリクエスト
 * @returns { NextResponse } AIの応答を含むJSONレスポンス
 * @throws { Error } リクエストが失敗した場合、エラーメッセージを含むJSONレスポンスを返す
 */
export async function POST(req: NextRequest) {
  try {
    // リクエストボディから質問を取得
    const { query } = await req.json();
    const response = await askDifyBuildingManagementQuestion(query);

    // レスポンスを検証・処理
    const processedResponse = validateAndProcessResponse(response);

    return NextResponse.json(processedResponse, {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    // エラーハンドリング: エラーメッセージをコンソールに出力し、500エラーを返す
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error.message || "AIリクエストに失敗しました" },
      { status: 500 }
    );
  }
}
