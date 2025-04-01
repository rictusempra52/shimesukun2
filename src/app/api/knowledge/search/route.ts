import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeBase } from "@/lib/dify/knowledge";

const DATASET_ID = process.env.DIFY_DATASET_ID; // 環境変数からデータセットIDを取得

/**
 * ナレッジベース検索 API
 */
export async function POST(request: NextRequest) {
  try {
    if (!DATASET_ID) {
      return NextResponse.json(
        { error: "サーバー側でデータセットIDが設定されていません" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query, topK, searchMethod } = body;

    if (!query) {
      return NextResponse.json(
        { error: "検索クエリは必須です" },
        { status: 400 }
      );
    }

    const result = await searchKnowledgeBase(
      DATASET_ID,
      query,
      topK || 3,
      searchMethod || "hybrid_search"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ナレッジベース検索エラー:", error);
    return NextResponse.json(
      { error: error.message || "検索に失敗しました" },
      { status: 500 }
    );
  }
}
