import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Habilita static export para Firebase Hosting
  images: {
    unoptimized: true // Necesario para static export
  }
};

export default nextConfig;
