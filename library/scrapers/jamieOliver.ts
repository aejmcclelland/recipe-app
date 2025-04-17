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

	const method: string[] = [];
	$('.rich-text ol li').each((i, el) => {
		const text = $(el).text().trim();
		if (text) {
			method.push(text);
		}
	});

	return {
		title,
		ingredients,
		method,
		sourceUrl: url,
	};
}
