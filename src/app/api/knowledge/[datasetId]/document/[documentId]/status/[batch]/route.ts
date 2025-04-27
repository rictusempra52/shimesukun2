import { NextResponse } from "next/server";
import { checkDocumentIndexingStatus } from "@/lib/dify/document";

/**
 * ドキュメントインデックス作成状況チェック API
 */
export async function GET(
  request: Request,
  {
    params,
  }: { params: { datasetId: string; documentId: string; batch: string } }
) {
  try {
    const { datasetId, documentId, batch } = params;

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
