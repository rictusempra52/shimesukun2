import { NextRequest, NextResponse } from "next/server";
import { askDifyBuildingManagementQuestion } from "@/lib/dify";

/**
 * AIの質問応答APIエンドポイント
 * クライアントからの質問をサーバーサイドのDify関数に転送
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const response = await askDifyBuildingManagementQuestion(query);

    // レスポンスが期待される形式かどうかを確認
    if (!response || typeof response !== "object") {
      console.error("Invalid API response format:", response);
      return NextResponse.json(
        { error: "APIからの予期しない応答形式です" },
        { status: 500 }
      );
    }

    // 正常なレスポンスを返却
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("AI API error:", error);
    // より詳細なエラーメッセージを提供
    const errorMessage = error.message || "AIリクエストに失敗しました";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
