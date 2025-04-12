// src/app/api/knowledge/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { difyAppRequest } from "@/lib/dify/api-service";
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
    
    console.log(`分析するファイル: ${file.name}, タイプ: ${file.type}, サイズ: ${file.size} bytes`);
    
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
      { id: "building5", name: "グリーンヒルズ札幌" }
    ];
    
    // ドキュメントタイプの例（これをAIに予測させる）
    const documentTypes = ["議事録", "報告書", "見積書", "契約書", "点検記録"];
    
    // Difyにメッセージを送信して分析
    const message = `
あなたはマンション管理文書を分析するAIアシスタントです。
以下のPDFまたは画像文書を分析し、次の情報を抽出または推測してください：

1. 文書タイトル：文書の内容を簡潔に表すタイトルを30文字以内で考えてください。
2. マンション名：文書に関連するマンションを以下のリストから選択してください。文書内に明確な記述がない場合は、内容から最も関連性が高いと思われるものを推測してください。
   ${availableBuildings.map(b => `- ${b.name} (ID: ${b.id})`).join('\n   ')}
3. 文書の説明：この文書が何についてのものか、その概要を100文字以内で説明してください。

回答は以下のJSON形式で出力してください：
\`\`\`json
{
  "title": "推奨タイトル",
  "building": "building1", // マンションのID
  "buildingName": "グランドパレス東京", // マンション名
  "description": "文書の説明文"
}
\`\`\`
`;

    // Dify APIへのリクエスト
    const result = await difyAppRequest("/completion-messages", "POST", {
      query: message,
      response_mode: "blocking",
      inputs: {
        file_url: file,  // ここでファイルを送信
      },
      // オプションでユーザーIDも送信できます
      user: "document-analyzer",
    });

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
        } else {
          console.warn("JSON形式のレスポンスが見つかりませんでした:", result.answer);
        }
      }
    } catch (error) {
      console.error("メタデータの解析エラー:", error);
      // エラーが発生しても処理は続行、空のメタデータを使用
    }

    return NextResponse.json({
      success: true,
      metadata,
      rawResponse: result
    });
  } catch (error: any) {
    console.error("ドキュメント分析エラー:", error);
    return NextResponse.json(
      { 
        error: error.message || "ドキュメントの分析に失敗しました",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}