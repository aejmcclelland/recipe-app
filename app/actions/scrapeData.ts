'use server';
import { scrapeBBC } from '@/library/scrapers/bbcGoodFood';
import { scrapeJamieOliver } from '@/library/scrapers/jamieOliver';

export async function scrapeData(formData: FormData) {
	const url = formData.get('url')?.toString();

	if (!url) throw new Error('Invalid URL');

	if (url.includes('bbcgoodfood.com')) {
		return await scrapeBBC(url);
	}
	if (url.includes('jamieoliver.com')) {
		return await scrapeJamieOliver(url);
	}

	throw new Error('This site is not supported yet');
}
