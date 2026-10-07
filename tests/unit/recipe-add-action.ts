import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const owner = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const categoryId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const recipeId = 'cccccccccccccccccccccccc';
let viewer: { id: string } | null;
let verified: boolean;
let google: boolean;
let limited: boolean;
let failSave: boolean;
let categories: boolean;
let limits: string[];
let uploads: number;
let writes: Record<string, unknown>[];
let names: string[];
let categoryLookups: unknown[];
mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../utils/getSessionUser.ts', { namedExports: { getSessionUser: async () => viewer } });
mock.module('../../models/User.ts', { defaultExport: {
	findById: (id: string) => {
		assert.equal(id, owner);
		return { select: () => ({ lean: async () => ({ emailVerified: verified, authProvider: google ? 'google' : 'credentials' }) }) };
	},
} });
mock.module('../../utils/rateLimit.ts', { namedExports: {
	enforceRateLimit: async (name: string, key: string) => {
		assert.equal(name, 'recipe-create'); limits.push(key);
		if (limited) throw new Error('Rate limited');
	},
} });
mock.module('../../models/Category.js', { defaultExport: {
	findById: async (id: string) => { categoryLookups.push(id); return categories ? { _id: categoryId } : null; },
	findOne: async (query: unknown) => { categoryLookups.push(query); return categories ? { _id: categoryId } : null; },
} });
mock.module('../../models/Ingredient.ts', { defaultExport: {
	findOne: async ({ name }: { name: string }) => { names.push(name); return name === 'pasta' ? { _id: 'pasta-id' } : null; },
	create: async ({ name }: { name: string }) => ({ _id: `${name}-id` }),
} });
mock.module('../../models/Recipe.ts', { defaultExport: class {
	_id = recipeId;
	constructor(private data: Record<string, unknown>) {}
	async save() { if (failSave) throw new Error('Save failed'); writes.push(this.data); }
} });
mock.module('../../config/cloudinary.js', { defaultExport: { uploader: {
	upload_stream(options: { folder: string }, callback: (error: Error | null, result: { secure_url: string }) => void) {
		assert.equal(options.folder, 'recipes'); uploads++;
		return { end(buffer: Buffer) { assert.equal(buffer.toString(), 'image'); callback(null, { secure_url: 'https://example.test/upload.jpg' }); } };
	},
} } });
mock.module('next/navigation', { namedExports: {
	redirect: (url: string) => { throw new Error(`NEXT_REDIRECT:${url}`); },
} });
registerHooks({ resolve(specifier, context, nextResolve) {
	return nextResolve(specifier === 'server-only'
		? new URL('../../node_modules/next/dist/compiled/server-only/empty.js', import.meta.url).href
		: specifier, context);
} });
const { default: addRecipe } = await import('../../app/actions/addRecipe.js');
function form() {
	const data = new FormData();
	for (const [key, value] of Object.entries({ name: 'Family pasta', category: categoryId, prepTime: '10', cookTime: '15', serves: '2', ingredients: JSON.stringify([{ ingredient: ' Pasta ', quantity: 0.5, unit: 'g' }, { ingredient: 'garlic', quantity: 2 }, { ingredient: 'salt' }]), steps: JSON.stringify(['  Cook. ', '', 'Serve.']) })) data.set(key, value);
	return data;
}
beforeEach(() => {
	viewer = { id: owner }; verified = true; google = false; limited = false; failSave = false; categories = true;
	limits = []; uploads = 0; writes = []; names = []; categoryLookups = [];
});
for (const state of ['signed-out', 'unverified', 'rate-limited'] as const) {
	test(`${state} creation is rejected before upload or persistence`, async () => {
		if (state === 'signed-out') viewer = null;
		if (state === 'unverified') verified = false;
		if (state === 'rate-limited') limited = true;
		await assert.rejects(() => addRecipe(form()), state === 'signed-out' ? /logged in/ : state === 'unverified' ? /verify your email/ : /Rate limited/);
		assert.deepEqual(writes, []); assert.equal(uploads, 0); assert.deepEqual(categoryLookups, []);
	});
}
test('manual create preserves category, owner, numeric values, ingredient relationships and redirect', async () => {
	await assert.rejects(() => addRecipe(form()), new RegExp(`NEXT_REDIRECT:/recipes/${recipeId}`));
	assert.deepEqual(limits, [owner]); assert.deepEqual(categoryLookups, [categoryId]);
	assert.deepEqual(names, ['pasta', 'garlic', 'salt']);
	assert.deepEqual(writes, [{ name: 'Family pasta', category: categoryId, user: owner, prepTime: 10, cookTime: 15, serves: 2, image: 'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg', ingredients: [
		{ ingredient: 'pasta-id', quantity: 0.5, unit: 'g' },
		{ ingredient: 'garlic-id', quantity: 2, unit: undefined },
		{ ingredient: 'salt-id', quantity: undefined, unit: undefined },
	], steps: ['Cook.', 'Serve.'] }]);
});
test('upload, Google verification exception and legacy category lookup remain supported', async () => {
	verified = false; google = true;
	const data = form(); data.set('category', 'Pasta'); data.set('imageFile', new File(['image'], 'pasta.png', { type: 'image/png' }));
	await assert.rejects(() => addRecipe(data), /NEXT_REDIRECT/);
	assert.equal(uploads, 1); assert.equal(writes[0].image, 'https://example.test/upload.jpg');
	assert.equal((categoryLookups[0] as { name: { $regex: RegExp } }).name.$regex.test('pasta'), true);
});
test('missing category and malformed ingredient JSON still reject', async () => {
	categories = false; await assert.rejects(() => addRecipe(form()), /Category not found/);
	categories = true; const data = form(); data.set('ingredients', '{');
	await assert.rejects(() => addRecipe(data), /Invalid ingredients format/);
	assert.deepEqual(writes, []);
});
for (const [ingredient, message] of [
	[{ ingredient: '', quantity: 1 }, /Ingredient name missing/],
	[{ ingredient: 'oil', unit: 'g' }, /Quantity required/],
	[{ ingredient: 'oil', quantity: 1, unit: 'other', customUnit: '' }, /Custom unit required/],
] as const) {
	test(`server ingredient validation is preserved: ${message}`, async () => {
		const data = form(); data.set('ingredients', JSON.stringify([ingredient]));
		await assert.rejects(() => addRecipe(data), message); assert.deepEqual(writes, []);
	});
}
test('server persistence errors still reject without a success redirect', async () => {
	failSave = true;
	await assert.rejects(() => addRecipe(form()), /Save failed/); assert.deepEqual(writes, []);
});
