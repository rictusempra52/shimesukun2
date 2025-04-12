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

    console.log(
      `ナレッジベース ${datasetId} へのファイルアップロードリクエスト受信`
    );

    // multipart/form-dataをそのまま転送
    const formData = await request.formData();

    // 送信されたファイル情報をログ出力
    const file = formData.get("file");
    if (file instanceof File) {
      console.log(
        `ファイル名: ${file.name}, タイプ: ${file.type}, サイズ: ${file.size} bytes`
      );
    }

    // メタデータ情報があれば取得してログ出力
    const metadataStr = formData.get("metadata");
    if (metadataStr && typeof metadataStr === "string") {
      try {
        const metadata = JSON.parse(metadataStr);
        console.log("メタデータ:", metadata);
      } catch (e) {
        console.warn("メタデータのパースエラー:", e);
      }
    }

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
