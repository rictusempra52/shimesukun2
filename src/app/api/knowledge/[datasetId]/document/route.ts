import { NextResponse } from "next/server";
import { getDocuments, createDocumentFromText } from "@/lib/dify/document";

/**
 * ドキュメント一覧取得 API
 */
export async function GET(request, { params }) {
  try {
    const datasetId = params.datasetId;
    if (!datasetId) {
      return NextResponse.json(
        { error: "ナレッジベースIDは必須です" },
        { status: 400 }
      );
    }

    // URLオブジェクトを使用してクエリパラメータを取得
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const keyword = url.searchParams.get("keyword") || undefined;

    const result = await getDocuments(datasetId, page, limit, keyword);

    return NextResponse.json(result);
  } catch (error) {
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
export async function POST(request, { params }) {
  try {
    const datasetId = params.datasetId;
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
  } catch (error) {
    console.error("テキストからドキュメント作成エラー:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメントの作成に失敗しました" },
      { status: 500 }
    );
  }
}
