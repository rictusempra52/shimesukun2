import type { NextConfig } from "next";

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
};

export default nextConfig;
