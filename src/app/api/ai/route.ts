import { NextRequest, NextResponse } from "next/server";
import { fetchDifyResponse } from "../../../lib/dify";

// POSTリクエストを処理する関数をエクスポート
export async function POST(req: NextRequest) {
  // リクエストボディからクエリを取得
  const { query } = await req.json();

  try {
    // Dify APIを呼び出して回答を取得
    const response = await fetchDifyResponse(query);
    // 成功した場合、レスポンスをJSON形式で返す
    return NextResponse.json(response);
  } catch (error) {
    // エラーが発生した場合、エラーメッセージを含むレスポンスを返す
    return NextResponse.json(
      { error: "Dify API request failed" },
      { status: 500 }
    );
  }
}
