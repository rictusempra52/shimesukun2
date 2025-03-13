import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的ページ生成からログイン関連ページを除外
  output: "standalone",
  // 認証が必要なページは静的生成しない
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
