import 'dotenv/config';
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary hostname
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.immediate.co.uk', // BBC Good Food images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io', // ✅ Add this
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/recipes/privacy-policy',
        destination: '/privacy-policy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
