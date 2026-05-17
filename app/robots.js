const baseUrl = 'https://www.rebekahsrecipes.com';

export default function robots() {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/', '/recipes', '/recipes/'],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
