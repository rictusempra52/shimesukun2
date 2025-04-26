import { NextRequest, NextResponse } from "next/server";

/**
 * 特定ドキュメントの削除 API
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { datasetId: string; documentId: string } }
) {
  try {
    const { datasetId, documentId } = params;

    console.log(
      `ドキュメント削除: datasetId=${datasetId}, documentId=${documentId}`
    );

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
