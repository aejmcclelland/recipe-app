'use server';

import { scrapeBBC } from '@/library/scrapers/bbcGoodFood';
import { scrapeJamieOliver } from '@/library/scrapers/jamieOliver';
import { scrapeBBCFood } from '@/library/scrapers/bbcFood';

export async function scrapeData(formData: FormData) {
	const url = (formData.get('url') as string | null)?.trim();
	if (!url) throw new Error('Invalid URL');

	// Pick the correct scraper once, then run it once.
	let data: any;

	if (url.includes('bbcgoodfood.com')) {
		data = await scrapeBBC(url);
	} else if (url.includes('jamieoliver.com')) {
		data = await scrapeJamieOliver(url);
	} else if (url.includes('bbc.co.uk/food/recipes')) {
		data = await scrapeBBCFood(url);
	} else {
		throw new Error('This site is not supported yet');
	}

	console.log('SCRAPE_DATA returning:', {
		url,
		title: data?.title,
		image: data?.image,
		ingredientsCount: Array.isArray(data?.ingredients) ? data.ingredients.length : 0,
		stepsCount: Array.isArray(data?.steps) ? data.steps.length : 0,
	});

	// Fail clearly so the client doesn’t see a silent "success"
	if (!data?.title) throw new Error('Scrape failed: missing title');
	if (!data?.ingredients?.length) throw new Error('Scrape failed: missing ingredients');
	if (!data?.steps?.length) throw new Error('Scrape failed: missing steps');

	return data;
}
