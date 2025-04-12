// src/app/api/knowledge/[datasetId]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { difyKnowledgeFormDataRequest } from "@/lib/dify/api-service";

// ナレッジベースへのファイルアップロードAPIエンドポイント
export async function POST(
  request: NextRequest,
  { params }: { params: { datasetId: string } }
) {
  try {
    // URLからデータセットIDを取得
    const datasetId = params.datasetId;
    if (!datasetId) {
      return NextResponse.json(
        { error: "データセットIDが必要です" },
        { status: 400 }
      );
    }

    // multipart/form-dataをそのまま転送
    const formData = await request.formData();

    // DifyのナレッジベースAPIにリクエストを送信
    const result = await difyKnowledgeFormDataRequest(
      `/datasets/${datasetId}/documents/upload`,
      "POST",
      formData
    );

    console.log("Dify document upload result:", result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error uploading document to Dify:", error);
    return NextResponse.json(
      { error: error.message || "ドキュメントのアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
