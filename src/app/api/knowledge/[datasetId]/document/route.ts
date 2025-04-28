import { NextRequest, NextResponse } from "next/server";
import { getDocuments, createDocumentFromText } from "@/lib/dify/document";

// Next.js 15.2.4の型定義に合わせて修正
type RouteContext = {
  params: Promise<{
    datasetId: string;
  }>;
};

/**
 * ドキュメント一覧取得 API
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { datasetId } = await context.params;
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
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { datasetId } = await context.params;
    // datasetIdが存在しない場合はエラーを返す
    if (!datasetId) {
      return NextResponse.json(
        { error: "ナレッジベースIDは必須です" },
        { status: 400 }
      );
    }

    // リクエストボディをJSON形式で取得
    const body = await request.json();
    const { text, metadata = {}, indexingTechnique = "high_quality" } = body;

    // テキストが存在しない場合はエラーを返す
    if (!text) {
      return NextResponse.json(
        { error: "テキスト内容は必須です" },
        { status: 400 }
      );
    }

    // titleがメタデータにあればそれを使用、なければ空のオブジェクト
    const documentMetadata = typeof metadata === "object" ? metadata : {};

    const result = await createDocumentFromText(
      datasetId,
      text,
      documentMetadata,
      indexingTechnique
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
