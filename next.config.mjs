import 'dotenv/config';
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	env: {
		NEXTAUTH_URL: process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}` // Use Vercel URL in production
			: 'http://localhost:3000', // Use localhost in development
		MONGODB_URI: process.env.MONGODB_URI,
	},
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
		],
	},
	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
};

export default nextConfig;
