import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Re-enable ESLint during builds now that we've fixed the typing issues
  eslint: {
    ignoreDuringBuilds: false, // Changed from true
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
