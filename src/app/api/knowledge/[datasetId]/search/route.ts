import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeBase } from "@/lib/dify/knowledge";

/**
 * ナレッジベース検索 API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { datasetId: string } }
) {
  try {
    const datasetId = params.datasetId;
    if (!datasetId) {
      return NextResponse.json(
        { error: "ナレッジベースIDは必須です" },
        { status: 400 }
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
      datasetId,
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
