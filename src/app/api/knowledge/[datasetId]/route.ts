import { NextRequest, NextResponse } from "next/server";
import { deleteKnowledgeBase } from "@/lib/dify/knowledge";

/**
 * 特定ナレッジベースの操作（削除）API
 */
export async function DELETE(
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

    await deleteKnowledgeBase(datasetId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("ナレッジベース削除エラー:", error);
    return NextResponse.json(
      { error: error.message || "ナレッジベースの削除に失敗しました" },
      { status: 500 }
    );
  }
}
