/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		NEXTAUTH_URL: process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: 'http://localhost:3000',
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com', // Cloudinary hostname
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
