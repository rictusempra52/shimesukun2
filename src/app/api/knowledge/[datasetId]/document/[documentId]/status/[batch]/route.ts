import { NextRequest, NextResponse } from "next/server";
import { checkDocumentIndexingStatus } from "@/lib/dify/document";

/**
 * ドキュメントインデックス作成状況チェック API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { datasetId: string; batch: string } }
) {
  try {
    const { datasetId, batch } = params;

    if (!datasetId || !batch) {
      return NextResponse.json(
        { error: "ナレッジベースIDとバッチIDは必須です" },
        { status: 400 }
      );
    }

    const result = await checkDocumentIndexingStatus(datasetId, batch);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("インデックス状態チェックエラー:", error);
    return NextResponse.json(
      { error: error.message || "インデックス状態の確認に失敗しました" },
      { status: 500 }
    );
  }
}
