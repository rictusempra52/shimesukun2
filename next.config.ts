import type { NextConfig } from "next";
// @ts-check
const { serverEnv } = require("./env/server");

const nextConfig: NextConfig = {
  output: "standalone",

  // 不要な環境変数設定を削除
  env: {
    NEXT_PUBLIC_SITE_URL: serverEnv.NEXT_PUBLIC_SITE_URL, // クライアント側のみ
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  serverExternalPackages: ["firebase", "firebase-admin"],
};

export default nextConfig;
