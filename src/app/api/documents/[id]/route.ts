import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin-config";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Firestoreからドキュメントを取得
    const docRef = db.collection("documents").doc(id);
    const docSnap = await docRef.get();

    // ドキュメントが存在しない場合
    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "ドキュメントが見つかりません" },
        { status: 404 }
      );
    }

    // ドキュメントデータを取得
    const document = {
      id: docSnap.id,
      ...docSnap.data(),
    };

    return NextResponse.json({ document });
  } catch (error) {
    console.error("ドキュメント取得エラー:", error);
    return NextResponse.json(
      { error: "ドキュメント取得に失敗しました" },
      { status: 500 }
    );
  }
}
