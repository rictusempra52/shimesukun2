import { getKnowledgeBases } from "@/lib/dify/api";
import { createKnowledgeBase } from "@/lib/dify/knowledge"; // 追加：知識ベース作成関数をインポート
import { NextRequest, NextResponse } from "next/server";

/**
 * ナレッジベースリストの取得 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");

    // 環境変数の診断情報をログ出力
    console.log("API環境変数診断:", {
      DIFY_API_ENDPOINT: process.env.DIFY_API_ENDPOINT ? "設定済み" : "未設定",
      DIFY_API_KEY: process.env.DIFY_API_KEY ? "設定済み" : "未設定",
      DIFY_KNOWLEDGE_API_KEY: process.env.DIFY_KNOWLEDGE_API_KEY
        ? "設定済み"
        : "未設定",
      // APIキーが設定されている場合、トークンの最初の5文字だけをデバッグ表示（セキュリティのため）
      KEY_PREFIX: process.env.DIFY_KNOWLEDGE_API_KEY
        ? `${process.env.DIFY_KNOWLEDGE_API_KEY.substring(0, 5)}...`
        : "なし",
    });

    const data = await getKnowledgeBases(page, limit);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("ナレッジベース取得API内部エラー:", error);
    return NextResponse.json(
      { error: error.message || "ナレッジベースの取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * ナレッジベース作成 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permission, indexingTechnique } = body;

    if (!name) {
      return NextResponse.json(
        { error: "ナレッジベース名は必須です" },
        { status: 400 }
      );
    }

    const result = await createKnowledgeBase(
      name,
      description,
      permission || "only_me",
      indexingTechnique || "high_quality"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ナレッジベース作成エラー:", error);
    return NextResponse.json(
      { error: error.message || "ナレッジベースの作成に失敗しました" },
      { status: 500 }
    );
  }
}
