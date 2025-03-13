import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的ページ生成からログイン関連ページを除外
  output: "standalone",

  // Next.js 15.2.2でサポートされている実験的オプション
  experimental: {
    // missingSuspenseWithCSRBailoutは認識されないのでコメントアウト
    // missingSuspenseWithCSRBailout: false,

    // 代わりに以下のオプションでサーバーコンポーネントの挙動を調整
    serverActions: {
      bodySizeLimit: "2mb",
    },
    serverComponentsExternalPackages: ["firebase", "firebase-admin"],
  },
};

export default nextConfig;
