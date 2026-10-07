import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import type { RecipeResult } from '../../types/recipe';

const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
let viewer: { id: string } | null;
let verified: boolean;
let google: boolean;
let limited: boolean;
let limits: string[];
let fetched: string[];
let writes: Record<string, unknown>[];
let parsed: number;
let result: RecipeResult;
mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../utils/getSessionUser.ts', { namedExports: { getSessionUser: async () => viewer } });
mock.module('../../models/User.ts', { defaultExport: {
	findById: (userId: string) => {
		assert.equal(userId, id);
		return { select: () => ({ lean: async () => ({ emailVerified: verified, authProvider: google ? 'google' : 'credentials' }) }) };
	},
} });
mock.module('../../utils/rateLimit.ts', { namedExports: {
	enforceRateLimit: async (name: string, key: string) => {
		assert.equal(name, 'recipe-import'); limits.push(key);
		if (limited) throw new Error('Too many recipe import attempts. Please try again later.');
	},
} });
for (const [file, name] of [['bbcGoodFood', 'scrapeBBC'], ['bbcFood', 'scrapeBBCFood'], ['jamieOliver', 'scrapeJamieOliver']]) {
	mock.module(`../../library/scrapers/${file}.ts`, { namedExports: {
		[name]: async (url: string) => { fetched.push(url); return result; },
	} });
}
mock.module('../../utils/parseScrapedRecipes.ts', { namedExports: {
	parseScrapedRecipe: async (data: RecipeResult) => { parsed++; return { name: data.title, ingredients: data.ingredients, steps: data.steps }; },
} });
mock.module('../../models/Recipe.ts', { defaultExport: class {
	constructor(private data: Record<string, unknown>) {}
	async save() { writes.push(this.data); }
	toObject() { return { ...this.data, _id: 'cccccccccccccccccccccccc' }; }
} });
// Next.js supplies this marker internally; use its bundled no-op in Node tests.
registerHooks({ resolve(specifier, context, nextResolve) {
	return nextResolve(specifier === 'server-only'
		? new URL('../../node_modules/next/dist/compiled/server-only/empty.js', import.meta.url).href
		: specifier, context);
} });
const { scrapeData } = await import('../../app/actions/scrapeData');
const { saveScrapedRecipe } = await import('../../app/actions/saveScrapedRecipe');
function form(url = 'https://www.bbcgoodfood.com/recipes/test') {
	const data = new FormData(); data.set('url', url); return data;
}
beforeEach(() => {
	viewer = { id }; verified = true; google = false; limited = false;
	limits = []; fetched = []; writes = []; parsed = 0;
	result = { title: 'Pasta', image: '', sourceUrl: '', ingredients: ['200g pasta'], steps: ['Cook the pasta.'] };
});
for (const state of ['signed-out', 'unverified'] as const) {
	test(`${state} cannot scrape or save`, async () => {
		if (state === 'signed-out') viewer = null;
		else verified = false;
		const message = state === 'signed-out' ? /logged in/ : /verify your email/;
		await assert.rejects(() => scrapeData(form()), message);
		await assert.rejects(() => saveScrapedRecipe(result, 'pasta'), message);
		assert.deepEqual(limits, []); assert.deepEqual(fetched, []); assert.deepEqual(writes, []);
	});
}
test('Google verification exception remains allowed and importing never persists', async () => {
	verified = false; google = true;
	const data = await scrapeData(form());
	assert.equal(data.sourceUrl, 'https://www.bbcgoodfood.com/recipes/test');
	assert.deepEqual(limits, [`${id}:scrape`]);
	assert.deepEqual(writes, []); assert.equal(parsed, 0);
});
test('both action rate-limit failures stop external reads and persistence', async () => {
	limited = true;
	await assert.rejects(() => scrapeData(form()), /Too many/);
	await assert.rejects(() => saveScrapedRecipe(result, 'pasta'), /Too many/);
	assert.deepEqual(limits, [`${id}:scrape`, `${id}:import`]);
	assert.deepEqual(fetched, []); assert.deepEqual(writes, []); assert.equal(parsed, 0);
});
test('invalid, credential-bearing and unsupported URLs never reach a scraper', async () => {
	for (const url of ['', 'not a URL', 'file:///etc/passwd', 'https://user:password@bbcgoodfood.com/recipes/test', 'https://bbcgoodfood.com.attacker.test/recipes/test', 'https://www.bbc.co.uk/news']) {
		await assert.rejects(() => scrapeData(form(url)));
	}
	assert.deepEqual(fetched, []); assert.deepEqual(writes, []);
});
test('missing scraped title, ingredients or method remains a failure', async () => {
	for (const patch of [{ title: '' }, { ingredients: [] }, { steps: [] }]) {
		const original = result; result = { ...result, ...patch };
		await assert.rejects(() => scrapeData(form()), /Scrape failed/);
		result = original;
	}
});
test('save validates category and untrusted payload before parsing or writing', async () => {
	await assert.rejects(() => saveScrapedRecipe(result, ' '), /Missing category/);
	for (const data of [null, {}, { ...result, title: '' }, { ...result, ingredients: [42] }, { ...result, steps: [''] }]) {
		await assert.rejects(() => saveScrapedRecipe(data, 'pasta'), /Invalid scraped recipe data/);
	}
	assert.equal(parsed, 0); assert.deepEqual(writes, []);
});
test('explicit save retains parser boundary, normalization and session ownership', async () => {
	await saveScrapedRecipe({ ...result, user: 'attacker', steps: ['  Cook   pasta.  '], sourceUrl: 'https://www.bbcgoodfood.com/recipes/test' }, ' pasta ');
	assert.equal(parsed, 1); assert.deepEqual(limits, [`${id}:import`]);
	assert.equal(writes.length, 1); assert.equal(writes[0].user, id);
	assert.equal(writes[0].category, 'pasta'); assert.deepEqual(writes[0].steps, ['Cook pasta.']);
	assert.equal(writes[0].sourceUrl, 'https://www.bbcgoodfood.com/recipes/test');
});
