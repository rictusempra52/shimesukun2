import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/data/documents";
import { cookies } from "next/headers";

// 正しい型定義
interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;

    // データソース設定をクッキーから取得
    const cookieStore = await cookies();
    const dataSource =
      (cookieStore.get("dataSource")?.value as "firebase" | "mock") ||
      "firebase";

    // 統一インターフェースでデータを取得
    const document = await getDocumentById(id, dataSource);

    // ドキュメントが存在しない場合
    if (!document) {
      return NextResponse.json(
        { error: "ドキュメントが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("ドキュメント取得エラー:", error);
    return NextResponse.json(
      { error: "ドキュメント取得に失敗しました" },
      { status: 500 }
    );
  }
}
