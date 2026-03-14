import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // For GitHub Pages project site: set NEXT_PUBLIC_BASE_PATH to your repo name (e.g. /ishhar-in-shaa-allah)
  ...(process.env.NEXT_PUBLIC_BASE_PATH && {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  }),
};

export default nextConfig;
