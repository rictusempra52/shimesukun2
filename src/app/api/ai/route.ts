import { NextRequest, NextResponse } from "next/server";
import { fetchDifyResponse } from "@/lib/server/dify"; // サーバー側の関数をインポート

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const response = await fetchDifyResponse(query);

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AIリクエストに失敗しました" },
      { status: 500 }
    );
  }
}
