import { NextRequest, NextResponse } from "next/server";
import { askDifyBuildingManagementQuestion } from "@/lib/dify";

/**
 * APIの最大実行時間を設定
 * デフォルトは30秒
 */
export const config = {
  maxDuration: 30,
};
/**
 * AIの質問応答APIエンドポイント
 * クライアントからの質問をサーバーサイドのDify関数に転送
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const response = await askDifyBuildingManagementQuestion(query);

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error.message || "AIリクエストに失敗しました" },
      { status: 500 }
    );
  }
}
