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

    return NextResponse.json(response, {
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
