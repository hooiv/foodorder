import type { NextConfig } from "next";

const nextConfig: NextConfig = {  // Temporarily disable ESLint during builds to test type compatibility on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'placekitten.com',
      'placeimg.com',
      'picsum.photos'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
