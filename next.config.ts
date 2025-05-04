import type { NextConfig } from "next";
import path from "path";

// 環境変数が存在するかチェックしてから使用
const nextConfig: NextConfig = {
  output: "standalone",

  // env設定は不要（サーバーサイドでは直接process.envから参照できる）

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  serverExternalPackages: ["firebase", "firebase-admin"],

  // Webpackの設定を追加
  webpack: (config, { isServer }) => {
    // PDF.jsワーカー用の設定
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist": path.join(process.cwd(), "node_modules/pdfjs-dist"),
    };

    return config;
  },
};

export default nextConfig;
