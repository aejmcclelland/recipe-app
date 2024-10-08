/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
				pathname: '/**', // This allows all paths under images.unsplash.com
			},
		],
	},
	compilerOptions: {
		baseUrl: '.',
		paths: {
			'@/config/*': ['config/*'],
		},
	},
};

export default nextConfig;
