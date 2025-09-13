// library/scrapers/bbcFood.ts
import * as cheerio from 'cheerio';
import type { RecipeResult } from '../../types/recipe';

function parseTimeToMinutes(timeStr: string): number {
	const time = timeStr.toLowerCase().trim();
	let totalMinutes = 0;
	const hourMatch = time.match(/(\d+)\s*h/);
	const minuteMatch = time.match(/(\d+)\s*m/);
	if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
	if (minuteMatch) totalMinutes += parseInt(minuteMatch[1], 10);
	if (!hourMatch && !minuteMatch) {
		const num = parseInt(time, 10);
		if (!isNaN(num)) totalMinutes = num;
	}
	return totalMinutes;
}

function parseServesToNumber(servesStr: string): number {
	const match = servesStr.match(/\d+/);
	return match ? parseInt(match[0], 10) : 0;
}

export async function scrapeBBCFood(url: string): Promise<RecipeResult> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
	const html = await res.text();
	const $ = cheerio.load(html);

	// Title
	const title = $('h1').first().text().trim() || 'Untitled Recipe';

	// Image
	const image =
		$('img[data-testid="hero-image"]').attr('src') ||
		$('meta[property="og:image"]').attr('content') ||
		'';

	// Ingredients: <ul class="ssrcss-1ynsflq-UnorderedList ..."><li>...</li></ul>
	const ingredients: string[] = [];
	$('.ssrcss-1ynsflq-UnorderedList li').each((_, el) => {
		ingredients.push($(el).text().replace(/\s+/g, ' ').trim());
	});

	// Steps/Method: <ol ...><li>...</li></ol>
	const steps: string[] = [];
	$('[data-testid="recipe-method"] ol li').each((_, el) => {
		const stepText = $(el).text().replace(/\s+/g, ' ').trim();
		if (stepText) steps.push(stepText);
	});

	// Prep/Cook/Serves (optional)
	let prepTimeRaw = '';
	let cookTimeRaw = '';
	let servesRaw = '';

	$('.ssrcss-fzx4as-Wrapper.e85aajs0 > div').each((_, div) => {
		const label = $(div).find('dt').text().toLowerCase();
		const value = $(div).find('dd').text().trim();
		if (label.includes('prepare')) prepTimeRaw = value;
		if (label.includes('cook')) cookTimeRaw = value;
		if (label.includes('serve')) servesRaw = value;
	});

	const prepTime = parseTimeToMinutes(prepTimeRaw);
	const cookTime = parseTimeToMinutes(cookTimeRaw);
	const serves = parseServesToNumber(servesRaw);

	return {
		title,
		image,
		ingredients,
		steps,
		prepTime, // raw: prepTimeRaw
		cookTime, // raw: cookTimeRaw
		serves,   // raw: servesRaw
		sourceUrl: url,
	};
}
