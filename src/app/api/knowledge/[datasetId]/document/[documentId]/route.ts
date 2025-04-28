import { NextRequest, NextResponse } from "next/server";
import { deleteDocument } from "@/lib/dify/document";

// Next.js 15.2.4の型定義に合わせて修正
type RouteContext = {
  params: Promise<{
    datasetId: string;
    documentId: string;
  }>;
};

/**
 * 特定ドキュメントの削除 API
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { datasetId, documentId } = await context.params;

    console.log(
      `ドキュメント削除: datasetId=${datasetId}, documentId=${documentId}`
    );

    // 実際にDify APIを使用してドキュメントを削除
    await deleteDocument(datasetId, documentId);

    return NextResponse.json({
      success: true,
      message: "ドキュメントが削除されました",
    });
  } catch (error: any) {
    console.error("ドキュメント削除エラー:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメントの削除に失敗しました" },
      { status: 500 }
    );
  }
}
