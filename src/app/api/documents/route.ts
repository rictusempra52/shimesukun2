import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin-config";

export async function GET() {
  try {
    const snapshot = await db.collection("documents").get();
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json(
      { error: "ドキュメント取得に失敗しました" },
      { status: 500 }
    );
  }
}
