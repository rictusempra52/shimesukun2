import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeBase } from "@/lib/dify/knowledge";

/**
 * ナレッジベース検索 API
 * Next.js 14+では、動的パラメータを扱う際に非同期で処理する必要がある
 */
export async function POST(
  request: NextRequest,
  context: { params: { datasetId: string } }
) {
  try {
    // 動的パラメータを非同期コンテキストで安全に取得
    const datasetId = context.params.datasetId;

    console.log("Received search request for dataset:", datasetId);

    if (!datasetId) {
      return NextResponse.json(
        { error: "ナレッジベースIDは必須です" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { query, topK, searchMethod } = body;

    console.log(
      `Search query: "${query}", method: ${searchMethod}, top_k: ${topK}`
    );

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
