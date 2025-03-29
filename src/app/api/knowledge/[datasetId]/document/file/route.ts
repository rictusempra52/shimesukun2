import { NextRequest, NextResponse } from "next/server";
import { createDocumentFromFile } from "@/lib/dify/document";

/**
 * ファイルからドキュメント作成 API
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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const indexingTechnique = formData.get("indexingTechnique") as "high_quality" | "economy" || "high_quality";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "ファイルは必須です" },
        { status: 400 }
      );
    }

    const result = await createDocumentFromFile(
      datasetId,
      file,
      indexingTechnique
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ファイルからドキュメント作成エラー:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメントの作成に失敗しました" },
      { status: 500 }
    );
  }
}
