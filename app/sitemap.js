const baseUrl = 'https://www.rebekahsrecipes.com';

export default function sitemap() {
	const lastModified = new Date();

	return [
		{
			url: baseUrl,
			lastModified,
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${baseUrl}/privacy-policy`,
			lastModified,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/terms-of-service`,
			lastModified,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
	];
}
