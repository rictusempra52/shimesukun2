// src/app/api/knowledge/[datasetId]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { difyKnowledgeFormDataRequest } from "@/lib/dify/api-service";

// ナレッジベースへのファイルアップロードAPIエンドポイント
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  try {
    // URLからデータセットIDを取得
    const { datasetId } = await params;
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

    // 新しいFormDataオブジェクトを作成（Difyが期待するフォーマットに合わせる）
    const difyFormData = new FormData();

    // fileフィールドをそのまま追加
    if (file) {
      difyFormData.append("file", file);
    }

    // Difyが期待するdataフィールドを追加（インデックス設定など）
    const dataConfig: {
      indexing_technique: string;
      process_rule: {
        rules: {
          pre_processing_rules: { id: string; enabled: boolean }[];
          segmentation: { separator: string; max_tokens: number };
        };
        mode: string;
      };
      metadata?: Record<string, any>;
    } = {
      indexing_technique: "high_quality",
      process_rule: {
        rules: {
          pre_processing_rules: [
            { id: "remove_extra_spaces", enabled: true },
            { id: "remove_urls_emails", enabled: true },
          ],
          segmentation: {
            separator: "###",
            max_tokens: 500,
          },
        },
        mode: "custom",
      },
    };

    // メタデータがあれば、それもdataConfigに含める
    if (metadataStr && typeof metadataStr === "string") {
      try {
        const metadata = JSON.parse(metadataStr);
        dataConfig["metadata"] = metadata;
      } catch (e) {
        console.warn("メタデータの追加エラー:", e);
      }
    }

    // dataフィールドをJSON文字列として追加
    difyFormData.append("data", JSON.stringify(dataConfig));

    // DifyのナレッジベースAPIにリクエストを送信 - 正しいパスと形式を使用
    // 正しいエンドポイント: `/datasets/${datasetId}/document/create_by_file`
    const result = await difyKnowledgeFormDataRequest(
      `/datasets/${datasetId}/document/create_by_file`,
      "POST",
      difyFormData
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
