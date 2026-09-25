import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import React, { type ReactElement } from 'react';
import mongoose from 'mongoose';
import { registerHooks } from 'node:module';

const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const otherId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const sharedId = 'eeeeeeeeeeeeeeeeeeeeeeee';
const recipeId = 'cccccccccccccccccccccccc';
let viewer: { id: string } | null;
let queries: Record<string, unknown>[];
let owner: string | null;
let sharedWith: string[] | undefined;
let bookmarks: string[];
let writes: Record<string, unknown>[];
let imageDeletes: number;
let saves: number;
function matches(filter: Record<string, unknown>): boolean {
	return Object.entries(filter).every(([key, value]) => {
		if (key === '$or') return (value as Record<string, unknown>[]).some(matches);
		if (key === '_id') return value === recipeId;
		if (key === 'user') return value === owner;
		if (key === 'sharedWith') return sharedWith?.includes(String(value)) ?? false;
		throw new Error(`Unexpected filter ${key}`);
	});
}
const recipeData = () => ({
	_id: new mongoose.Types.ObjectId(recipeId), name: 'Private soup',
	user: owner ? new mongoose.Types.ObjectId(owner) : null,
	ingredients: [], steps: ['Cook'], image: 'https://example.com/placeholder-food.jpg',
});
const privateUser = {
	_id: ownerId, password: 'secret-password-hash',
	resetPasswordTokenHash: 'secret-reset-hash', emailVerified: new Date(),
	verificationToken: 'secret-verification-token', email: 'private@example.com',
};
// Match Next.js's server-side alias without installing another dependency.
registerHooks({ resolve(specifier, context, nextResolve) {
	return nextResolve(specifier === 'server-only'
		? new URL('../../node_modules/next/dist/compiled/server-only/empty.js', import.meta.url).href
		: specifier, context);
} });
mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../models/Ingredient.ts', { defaultExport: {} });
mock.module('../../utils/getSessionUser.ts', { namedExports: { getSessionUser: async () => viewer } });
mock.module('../../utils/requireVerifiedEmail.ts', { namedExports: {
	EmailVerificationRequiredError: class extends Error {},
	requireVerifiedEmail: async () => {},
} });
mock.module('../../config/cloudinary.js', { defaultExport: { uploader: {
	destroy: async () => { imageDeletes++; },
} } });
mock.module('next/cache', { namedExports: { revalidatePath: () => {} } });
mock.module('next/navigation', { namedExports: { redirect: () => {} } });
mock.module('../../models/User.ts', { defaultExport: {
	findById: () => {
		const user = {
			firstName: 'Recipe', email: 'viewer@example.com',
			get bookmarks() { return Object.assign(bookmarks, {
				pull: (id: string) => { bookmarks = bookmarks.filter(value => value !== id); },
			}); },
			set bookmarks(value: string[]) { bookmarks = value; },
			save: async () => { saves++; },
		};
		return Object.assign(Promise.resolve(user), {
			select: () => ({ lean: async () => user }),
			populate: (options: { match?: Record<string, unknown>; select?: string }) => ({
				lean: async () => ({ bookmarks: bookmarks.includes(recipeId) && matches(options.match ?? {})
					? [{ ...recipeData(), ...(options.select === '-sharedWith' ? {} : { sharedWith }) }] : [] }),
			}),
		});
	},
} });
mock.module('../../models/Recipe.ts', { defaultExport: {
	exists: async (filter: Record<string, unknown>) => matches(filter) ? { _id: recipeId } : null,
	find: (filter: Record<string, unknown>) => ({ populate: () => ({ lean: async () => matches(filter) ? [recipeData()] : [] }) }),
	findOneAndUpdate: async (filter: Record<string, unknown>, update: Record<string, unknown>) => {
		writes.push({ filter, update }); return matches(filter) ? recipeData() : null;
	},
	findOneAndDelete: async (filter: Record<string, unknown>) => {
		writes.push({ filter }); return matches(filter) ? recipeData() : null;
	},
	findOne: (filter: Record<string, unknown>) => {
		queries.push(filter);
		let populatedOwner = false;
		let excludeSharing = false;
		const query = Object.assign(Promise.resolve(matches(filter) ? recipeData() : null), {
			select: (fields: string) => { excludeSharing = fields === '-sharedWith'; return query; },
			populate: (options: string | { path: string }) => {
				if (options === 'user' || (typeof options === 'object' && options.path === 'user')) populatedOwner = true;
				return query;
			},
			lean: async () => matches(filter) ? {
				...recipeData(),
				user: populatedOwner ? privateUser : recipeData().user,
				...(excludeSharing ? {} : { sharedWith }),
			} : null,
		});
		return query;
	},
} });
// Inspect the actual page's client props without executing browser-only UI.
for (const name of ['RecipeCard', 'HomeButton', 'RecipeNotFound', 'EditRecipeButton', 'DeleteRecipeButton', 'BookmarkButton', 'RecipeOverviewCard', 'BookmarkRecipeCard', 'UserDetails']) {
	mock.module(`../../components/${name}.jsx`, { defaultExport: name });
}
mock.module('@mui/material', { namedExports: { Box: 'Box', Typography: 'Typography', Container: 'Container' } });
// tsx uses the classic JSX runtime for this project's jsx: preserve setting.
Object.assign(globalThis, { React });
const { default: RecipeDetailPage } = await import('../../app/recipes/[id]/page.jsx');
const { default: ProfilePage } = await import('../../app/recipes/profile/page.jsx');
const { default: editRecipe } = await import('../../app/actions/editRecipe.js');
const { default: deleteRecipe } = await import('../../app/actions/deleteRecipe.js');
const { default: addBookmark } = await import('../../app/actions/addBookmark.js');
const { default: bookmarkRecipe } = await import('../../app/actions/bookmarkRecipe.js');
const { default: saveRecipe } = await import('../../app/actions/saveRecipe.js');
const { default: deleteBookmark } = await import('../../app/actions/deleteBookmark.js');

function elements(node: React.ReactNode): ReactElement<Record<string, unknown>>[] {
	if (Array.isArray(node)) return node.flatMap(elements);
	if (!React.isValidElement<Record<string, unknown>>(node)) return [];
	return [node, ...elements(node.props.children as React.ReactNode)];
}
const render = (id = recipeId) => RecipeDetailPage({ params: Promise.resolve({ id }) });
beforeEach(() => {
	viewer = { id: ownerId }; owner = ownerId; queries = [];
	sharedWith = [sharedId]; bookmarks = []; writes = []; imageDeletes = 0; saves = 0;
});

test('owner can view recipe and keeps edit/delete controls', async () => {
	const tree = elements(await render());
	for (const type of ['RecipeCard', 'EditRecipeButton', 'DeleteRecipeButton']) {
		assert.ok(tree.some(element => element.type === type));
	}
	assert.deepEqual(queries, [{ _id: recipeId, $or: [{ user: ownerId }, { sharedWith: ownerId }] }]);
});
test('another authenticated user receives no recipe client data', async () => {
	viewer = { id: otherId };
	const result = await render();
	assert.equal(result.type, 'RecipeNotFound');
	assert.ok(!JSON.stringify(result).includes('Private soup'));
});
test('signed-out user receives no recipe client data and no recipe query', async () => {
	viewer = null;
	assert.equal((await render()).type, 'RecipeNotFound');
	assert.deepEqual(queries, []);
});
test('owner client props contain only owner ID, never a populated User', async () => {
	const tree = elements(await render());
	for (const element of tree.filter(e => e.type === 'RecipeCard' || e.type === 'BookmarkButton')) {
		const recipe = element.props.recipe as { user: unknown };
		assert.equal(recipe.user, ownerId);
		assert.ok(!('sharedWith' in recipe));
		const payload = JSON.stringify(recipe);
		for (const key of Object.keys(privateUser).filter(key => key !== '_id')) {
			assert.ok(!payload.includes(key), `Unexpected owner field: ${key}`);
		}
	}
});

test('shared user can read without edit/delete controls or sharing data', async () => {
	viewer = { id: sharedId };
	const tree = elements(await render());
	assert.ok(tree.some(e => e.type === 'RecipeCard'));
	assert.ok(!tree.some(e => e.type === 'EditRecipeButton' || e.type === 'DeleteRecipeButton'));
	assert.ok(!JSON.stringify(tree).includes('sharedWith'));
});
test('legacy recipe without sharedWith is owner-only', async () => {
	sharedWith = undefined;
	assert.ok(elements(await render()).some(e => e.type === 'RecipeCard'));
	viewer = { id: sharedId };
	assert.equal((await render()).type, 'RecipeNotFound');
});

for (const id of [sharedId, otherId, null]) {
	test(`non-owner cannot edit/delete: ${id}`, async () => {
		viewer = id ? { id } : null;
		await assert.rejects(() => editRecipe(recipeId, new FormData()));
		await assert.rejects(() => deleteRecipe(recipeId));
		assert.deepEqual(writes, []);
		assert.equal(imageDeletes, 0);
	});
}
test('owner edits and deletes with owner-scoped final mutation filters', async () => {
	const form = new FormData();
	form.set('name', 'Updated soup');
	form.set('ingredients', JSON.stringify([{ ingredient: 'ffffffffffffffffffffffff', quantity: 1 }]));
	form.set('user', otherId);
	form.set('sharedWith', JSON.stringify([otherId]));
	await editRecipe(recipeId, form);
	await deleteRecipe(recipeId);
	assert.deepEqual(writes.map(w => w.filter), [
		{ _id: recipeId, user: ownerId }, { _id: recipeId, user: ownerId },
	]);
	assert.equal((writes[0].update as { user: string }).user, ownerId);
	assert.ok(!('sharedWith' in (writes[0].update as object)));
});

for (const action of [addBookmark, bookmarkRecipe, saveRecipe]) {
	for (const id of [ownerId, sharedId, otherId, null]) {
		test(`${action.name}: bookmark creation checks current access for ${id}`, async () => {
			viewer = id ? { id } : null;
			if (id === ownerId || id === sharedId) {
				await action(recipeId);
				assert.deepEqual([...bookmarks], [recipeId]);
				assert.equal(saves, 1);
			} else {
				await assert.rejects(() => action(recipeId));
				assert.equal(saves, 0);
			}
		});
	}
	test(`${action.name}: malformed ID fails without saving`, async () => {
		await assert.rejects(() => action('invalid'));
		assert.equal(saves, 0);
	});
}
for (const action of [bookmarkRecipe, saveRecipe, deleteBookmark]) {
	test(`${action.name}: stale bookmark can still be removed`, async () => {
		viewer = { id: sharedId }; bookmarks = [recipeId]; sharedWith = [];
		await action(recipeId);
		assert.equal(bookmarks.length, 0);
		assert.equal(saves, 1);
	});
}
test('profile shows accessible bookmark, excludes it after revocation; bookmark grants no access', async () => {
	viewer = { id: sharedId }; bookmarks = [recipeId];
	assert.ok(elements(await ProfilePage()).some(e => e.type === 'BookmarkRecipeCard'));
	assert.ok(!JSON.stringify(await ProfilePage()).includes('sharedWith'));
	sharedWith = [];
	assert.ok(!elements(await ProfilePage()).some(e => e.type === 'BookmarkRecipeCard'));
	assert.ok(!JSON.stringify(await ProfilePage()).includes('Private soup'));
	assert.equal((await render()).type, 'RecipeNotFound');
	await assert.rejects(() => addBookmark(recipeId));
});
test('malformed mutation IDs fail without side effects', async () => {
	await assert.rejects(() => editRecipe('invalid', new FormData()), /Recipe not found/);
	await assert.rejects(() => deleteRecipe('invalid'), /Recipe not found/);
	assert.deepEqual(writes, []);
	assert.equal(imageDeletes, 0);
});
test('missing, malformed and ownerless recipes fail closed', async () => {
	assert.equal((await render('dddddddddddddddddddddddd')).type, 'RecipeNotFound');
	assert.equal((await render('invalid')).type, 'RecipeNotFound');
	owner = null;
	assert.equal((await render()).type, 'RecipeNotFound');
});
