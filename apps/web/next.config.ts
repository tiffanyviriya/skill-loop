import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skill-loop/db", "@skill-loop/domain"]
};

export default nextConfig;
