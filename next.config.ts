import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // standalone only for Docker; Vercel breaks with output:"standalone"
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
