import { NextRequest, NextResponse } from "next/server";
import { getDocuments, createDocumentFromText } from "@/lib/dify/document";

/**
 * ドキュメント一覧取得 API
 */
export async function GET(
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const keyword = searchParams.get("keyword") || undefined;

    const result = await getDocuments(datasetId, page, limit, keyword);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ドキュメント一覧取得エラー:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメント一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * テキストからドキュメント作成 API
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

    const body = await request.json();
    const { name, text, indexingTechnique } = body;

    if (!name || !text) {
      return NextResponse.json(
        { error: "ドキュメント名とテキスト内容は必須です" },
        { status: 400 }
      );
    }

    const result = await createDocumentFromText(
      datasetId,
      name,
      text,
      indexingTechnique || "high_quality"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("テキストからドキュメント作成エラー:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメントの作成に失敗しました" },
      { status: 500 }
    );
  }
}
