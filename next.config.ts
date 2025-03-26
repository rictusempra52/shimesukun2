import type { NextConfig } from "next";
// @ts-check
const { serverEnv } = require("./env/server");

const nextConfig: NextConfig = {
  // 静的ページ生成からログイン関連ページを除外
  output: "standalone",

  // 環境変数を使用して設定
  env: {
    // サーバーサイドでのみ使用する環境変数
    NODE_ENV: serverEnv.NODE_ENV,
    SECRET_TOKEN: serverEnv.SECRET_TOKEN,
    DIFY_API_KEY: serverEnv.DIFY_API_KEY,
    DIFY_API_ENDPOINT: serverEnv.DIFY_API_ENDPOINT,

    // クライアントサイドで使用する環境変数
    NEXT_PUBLIC_SITE_URL: serverEnv.NEXT_PUBLIC_SITE_URL,
  },

  // Next.js 15.2.2でサポートされているオプション
  experimental: {
    // サーバーアクションの設定
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 外部パッケージ設定（experimental配下から移動）
  serverExternalPackages: ["firebase", "firebase-admin"],
};

export default nextConfig;
