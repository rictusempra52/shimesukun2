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
    // paramsを適切に扱うために、非同期コンテキスト内で直接アクセス
    const { datasetId } = params;

    if (!datasetId) {
      return NextResponse.json(
        { error: "ナレッジベースIDは必須です" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { query, topK, searchMethod } = body;

    // クエリがnullの場合も許容するように変更（空検索の対応）
    if (query === undefined) {
      return NextResponse.json(
        { error: "検索クエリは必須です" },
        { status: 400 }
      );
    }

    const result = await searchKnowledgeBase(
      datasetId,
      query || "", // nullの場合は空文字を使用
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
