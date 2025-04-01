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
