import type { NextConfig } from "next";
// @ts-check
const { serverEnv } = require("./src/lib/env/server");

const nextConfig: NextConfig = {
  output: "standalone",

  env: {
    DIFY_API_KEY: serverEnv.DIFY_API_KEY,
    DIFY_API_ENDPOINT: serverEnv.DIFY_API_ENDPOINT,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  serverExternalPackages: ["firebase", "firebase-admin"],
};

export default nextConfig;
