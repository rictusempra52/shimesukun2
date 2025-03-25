import { NextRequest, NextResponse } from "next/server";
import { fetchDifyResponse } from "../../../lib/dify";

// POSTリクエストを処理する関数をエクスポート
export async function POST(req: NextRequest) {
  // リクエストボディからクエリを取得
  const { query } = await req.json();

  try {
    // Dify APIを呼び出して回答を取得
    const response = await fetchDifyResponse(query);

    // キャッシュを無効化するためのヘッダーを設定
    const headers = {
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
    };

    // 成功した場合、レスポンスをJSON形式で返す（キャッシュ無効化ヘッダー付き）
    return NextResponse.json(response, {
      headers,
      status: 200,
    });
  } catch (error) {
    // エラーが発生した場合、エラーメッセージを含むレスポンスを返す（キャッシュ無効化ヘッダー付き）
    return NextResponse.json(
      { error: "Dify API request failed" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
          Pragma: "no-cache",
        },
        status: 500,
      }
    );
  }
}
