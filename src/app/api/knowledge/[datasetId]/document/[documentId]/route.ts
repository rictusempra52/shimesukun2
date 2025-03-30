import { NextRequest, NextResponse } from "next/server";
import { deleteDocument } from "@/lib/dify/document";

/**
 * 特定ドキュメントの削除 API
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { datasetId: string; documentId: string } }
) {
  try {
    const { datasetId, documentId } = params;

    if (!datasetId || !documentId) {
      return NextResponse.json(
        { error: "ナレッジベースIDとドキュメントIDは必須です" },
        { status: 400 }
      );
    }

    await deleteDocument(datasetId, documentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ドキュメント削除エラー:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメントの削除に失敗しました" },
      { status: 500 }
    );
  }
}
