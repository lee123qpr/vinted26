import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during production builds (errors will still show in development)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow external Supabase images
      },
      {
        protocol: 'http',
        hostname: '**', // Allow local images
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  serverExternalPackages: [
    '@react-email/components',
    '@react-email/render',
  ],
};

export default nextConfig;
