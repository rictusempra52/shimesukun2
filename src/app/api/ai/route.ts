import { NextRequest, NextResponse } from "next/server";
import { askBuildingManagementQuestion } from "@/lib/gemini";
import { getDocumentById } from "@/lib/data/documents";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const body = await request.json();
    const { question, documentId } = body;

    if (!question) {
      return NextResponse.json(
        { error: "質問が入力されていません" },
        { status: 400 }
      );
    }

    // 関連する文書コンテキストを取得（オプション）
    let documentContext;
    if (documentId) {
      // データソース設定をクッキーから取得
      const cookieStore = await cookies();
      const dataSource =
        (cookieStore.get("dataSource")?.value as "firebase" | "mock") ||
        "firebase";

      const document = await getDocumentById(documentId, dataSource);
      if (document) {
        documentContext = `タイトル: ${document.title}
内容: ${document.text ?? "内容なし"} 
日付: ${document.date}
マンション名: ${document.building}`;
      }
    }

    // Gemini APIに質問を送信
    const answer = await askBuildingManagementQuestion(
      question,
      documentContext
    );

    return NextResponse.json({
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI処理エラー:", error);
    return NextResponse.json(
      { error: "AI回答の生成に失敗しました" },
      { status: 500 }
    );
  }
}
