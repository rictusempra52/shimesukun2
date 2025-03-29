import { NextRequest, NextResponse } from "next/server";
import {
  getKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
} from "@/lib/dify/knowledge";

/**
 * ナレッジベースリストの取得 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getKnowledgeBases(page, limit);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ナレッジベースリスト取得エラー:", error);
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
