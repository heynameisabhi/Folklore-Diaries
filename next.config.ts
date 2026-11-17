import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [],
    remotePatterns: [],
    unoptimized: true, // This allows local file paths
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
