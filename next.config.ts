import type { NextConfig } from "next";
// @ts-check
const { serverEnv } = require("./env/server");

const nextConfig: NextConfig = {
  // 静的ページ生成からログイン関連ページを除外
  output: "standalone",

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
