/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint is a dev-time concern; don't fail production builds on ESLint errors.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Useful for fixing some R3F/Three.js texture loading issues
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com', // Added for your interviewer background
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Clerk-hosted user avatars
      },
    ],
  },
  // Helps with 3D library transpilation if needed
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = nextConfig;