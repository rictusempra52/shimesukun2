// Zodに依存しない環境変数の実装

export const serverEnv = {
  // 環境変数にデフォルト値を設定
  DIFY_API_KEY: process.env.DIFY_API_KEY || "",
  DIFY_API_ENDPOINT: process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // 必要に応じて他の環境変数も追加
};

// 簡易バリデーション
const missingVars = Object.entries(serverEnv)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(
    `⚠️ 以下の環境変数が設定されていません: ${missingVars.join(", ")}`
  );
  // 本番環境では警告のみ表示し、実行は続ける
}
