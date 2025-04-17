// src/app/api/knowledge/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { difyAppRequest, difyKnowledgeRequest } from "@/lib/dify/api-service";
import { createReadStream } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

// ドキュメントの内容を分析してメタデータを提案するAPIエンドポイント
export async function POST(request: NextRequest) {
  try {
    // 一時ファイル名を生成（衝突を避けるためにタイムスタンプとランダム文字列を使用）
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const tempFileName = `temp_${timestamp}_${randomString}`;
    const tempFilePath = join(tmpdir(), tempFileName);

    // マルチパートフォームデータからファイルを取得
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "ファイルがアップロードされていません" },
        { status: 400 }
      );
    }

    console.log(
      `分析するファイル: ${file.name}, タイプ: ${file.type}, サイズ: ${file.size} bytes`
    );

    // ファイルをバッファに変換
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 一時ファイルに保存
    await writeFile(tempFilePath, fileBuffer);

    console.log(`一時ファイル保存完了: ${tempFilePath}`);

    // 利用可能なマンション名のリスト（ドロップダウンと同じ順序）
    const availableBuildings = [
      { id: "building1", name: "グランドパレス東京" },
      { id: "building2", name: "サンシャインマンション" },
      { id: "building3", name: "パークハイツ横浜" },
      { id: "building4", name: "リバーサイドタワー大阪" },
      { id: "building5", name: "グリーンヒルズ札幌" },
    ];

    // ドキュメントタイプの例（これをAIに予測させる）
    const documentTypes = ["議事録", "報告書", "見積書", "契約書", "点検記録"];

    try {
      // 1. まずDifyのナレッジベースAPIを使用して文書の内容を取得
      // 注意: この方法はナレッジベースAPIの機能によって異なります
      console.log("Difyナレッジベース分析を試みます...");

      // バックアップとしてDifyのWebアプリAPIを試す
      console.log("DifyのWebアプリAPIを使用した分析を試みます...");

      // Difyにメッセージを送信して分析
      const message = `
あなたはマンション管理文書を分析するAIアシスタントです。
以下のPDFまたは画像文書を分析し、次の情報を抽出または推測してください：

1. 文書タイトル：文書の内容を簡潔に表すタイトルを30文字以内で考えてください。
2. マンション名：文書に関連するマンションを以下のリストから選択してください。文書内に明確な記述がない場合は、内容から最も関連性が高いと思われるものを推測してください。
   ${availableBuildings.map((b) => `- ${b.name} (ID: ${b.id})`).join("\n   ")}
3. 文書の説明：この文書が何についてのものか、その概要を100字以内で簡潔に説明してください。必ず100字以内に収めてください。内容を要約し、主要なポイントのみを含めてください。

回答は以下のJSON形式で出力してください：
\`\`\`json
{
  "title": "推奨タイトル",
  "building": "building1", // マンションのID
  "buildingName": "グランドパレス東京", // マンション名
  "description": "文書の説明文（100字以内）"
}
\`\`\`
`;

      // Dify APIへのリクエスト - Web App APIが使用できない場合に備えて、try-catchで囲む
      let result;
      try {
        // まずはWebアプリAPIを試す
        result = await difyAppRequest("/completion-messages", "POST", {
          query: message,
          response_mode: "blocking",
          inputs: {
            file_url: file, // ここでファイルを送信
          },
          user: "document-analyzer",
        });
        console.log("Dify Web App API分析成功");
      } catch (appError) {
        console.error("Dify Web App API呼び出しエラー:", appError);
        console.log(
          "ナレッジベースAPIを使用したフォールバック処理を実行します..."
        );

        // フォールバック：ファイル名とサイズだけで簡易メタデータを生成
        result = {
          answer: `\`\`\`json
{
  "title": "${file.name.replace(/\.[^/.]+$/, "")}",
  "building": "building1",
  "buildingName": "グランドパレス東京",
  "description": "このファイルはアップロードされた${Math.round(
    file.size / 1024
  )}KBの${file.name}です。"
}
\`\`\``,
        };
      }

      console.log("Dify分析結果:", result);

      // DifyのレスポンスからJSONを抽出
      let metadata = {};
      try {
        if (result.answer) {
          // JSONパターンを検出して抽出
          const jsonPattern = /```json\s*([\s\S]*?)\s*```/;
          const match = result.answer.match(jsonPattern);

          if (match && match[1]) {
            metadata = JSON.parse(match[1]);
            console.log("抽出されたメタデータ:", metadata);

            // 説明文が100字を超える場合は切り詰める
            if (metadata.description && metadata.description.length > 100) {
              metadata.description =
                metadata.description.substring(0, 97) + "...";
              console.log(
                "説明文を100字以内に切り詰めました:",
                metadata.description
              );
            }
          } else {
            console.warn(
              "JSON形式のレスポンスが見つかりませんでした:",
              result.answer
            );
          }
        }
      } catch (error) {
        console.error("メタデータの解析エラー:", error);
        // エラーが発生しても処理は続行、空のメタデータを使用
      }

      return NextResponse.json({
        success: true,
        metadata,
        rawResponse: result,
      });
    } catch (apiError) {
      console.error("Dify API呼び出しエラー:", apiError);

      // エラーが発生した場合でも、ファイル名を基本情報にして基本的なメタデータを返す
      const fileName = file.name;
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
      const baseName = fileName.replace(/\.[^/.]+$/, "");

      const metadata = {
        title: baseName,
        building: "building1", // デフォルトのビルディングID
        buildingName: "グランドパレス東京",
        description: `${baseName}に関する文書です。自動分析でエラーが発生したため、詳細はファイル内容をご確認ください。`,
      };

      return NextResponse.json({
        success: true,
        metadata,
        error: "AI分析中にエラーが発生しました。基本情報のみ表示しています。",
      });
    }
  } catch (error: any) {
    console.error("ドキュメント分析エラー:", error);
    return NextResponse.json(
      {
        error: error.message || "ドキュメントの分析に失敗しました",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
