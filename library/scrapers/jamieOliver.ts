import * as cheerio from 'cheerio';
import { RecipeResult } from '@/types/recipe';

export async function scrapeJamieOliver(url: string): Promise<RecipeResult> {
	const res = await fetch(url);
	const html = await res.text();
	const $ = cheerio.load(html);

	const title = $('h1').text().trim();

	const ingredients: string[] = [];
	$('.ingredients-rich-text p.type-body').each((i, el) => {
		const text = $(el).text().trim();
		if (text && !text.toLowerCase().includes('shop')) {
			ingredients.push(text);
		}
	});

	const steps: string[] = [];
	$('.rich-text ol li').each((i, el) => {
		const text = $(el).text().trim();
		if (text) {
			steps.push(text);
		}
	});

	const image =
		$('meta[property="og:image"]').attr('content') ||
		'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png';

	return {
		title,
		ingredients,
		steps,
		sourceUrl: url,
		image,
	};
}
