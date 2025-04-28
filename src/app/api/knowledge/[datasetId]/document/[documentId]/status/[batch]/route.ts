import { NextRequest, NextResponse } from "next/server";
import { checkDocumentIndexingStatus } from "@/lib/dify/document";

// Next.js 15.2.4の型定義に合わせて修正
type RouteContext = {
  params: Promise<{
    datasetId: string;
    documentId: string;
    batch: string;
  }>;
};

/**
 * ドキュメントインデックス作成状況チェック API
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { datasetId, documentId, batch } = await context.params;

    if (!datasetId || !documentId || !batch) {
      return NextResponse.json(
        { error: "ナレッジベースID、ドキュメントID、バッチIDは必須です" },
        { status: 400 }
      );
    }

    const result = await checkDocumentIndexingStatus(
      datasetId,
      documentId,
      batch
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("インデックス状態チェックエラー:", error);
    return NextResponse.json(
      { error: error.message || "インデックス状態の確認に失敗しました" },
      { status: 500 }
    );
  }
}
