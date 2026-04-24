'use server';

import { scrapeBBC } from '@/library/scrapers/bbcGoodFood';
import { scrapeJamieOliver } from '@/library/scrapers/jamieOliver';
import { scrapeBBCFood } from '@/library/scrapers/bbcFood';
import {
	resolveSupportedScrapeTarget,
	SUPPORTED_SCRAPE_SITES,
} from '@/utils/scrapeUrlValidation';

export async function scrapeData(formData: FormData) {
	const url = (formData.get('url') as string | null)?.trim();
	if (!url) throw new Error('Invalid URL');

	const { normalizedUrl, siteKey } = resolveSupportedScrapeTarget(url);

	let data: any;
	switch (siteKey) {
		case SUPPORTED_SCRAPE_SITES.BBC_GOOD_FOOD:
			data = await scrapeBBC(normalizedUrl);
			break;
		case SUPPORTED_SCRAPE_SITES.JAMIE_OLIVER:
			data = await scrapeJamieOliver(normalizedUrl);
			break;
		case SUPPORTED_SCRAPE_SITES.BBC_FOOD:
			data = await scrapeBBCFood(normalizedUrl);
			break;
		default:
			throw new Error('This site is not supported yet');
	}

	// Fail clearly so the client doesn’t see a silent "success"
	if (!data?.title) throw new Error('Scrape failed: missing title');
	if (!data?.ingredients?.length) throw new Error('Scrape failed: missing ingredients');
	if (!data?.steps?.length) throw new Error('Scrape failed: missing steps');

	return {
		...data,
		sourceUrl:
			typeof data?.sourceUrl === 'string' && data.sourceUrl.trim()
				? data.sourceUrl
				: normalizedUrl,
	};
}
