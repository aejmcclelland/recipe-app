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
let userLookups: string[];
let limited: boolean;
let databaseFailure: boolean;
const accounts = [ownerId, sharedId, otherId].map((id, i) => ({
	...{ password: 'private-hash', resetPasswordTokenHash: 'private-token' },
	_id: new mongoose.Types.ObjectId(id), email: `${['owner', 'recipient', 'other'][i]}@example.com`,
}));
function matches(filter: Record<string, unknown>): boolean {
	return Object.entries(filter).every(([key, value]) => {
		if (key === '$or') return (value as Record<string, unknown>[]).some(matches);
		if (key === '_id') return value === recipeId;
		if (key === 'user') return typeof value === 'object' && value !== null ? (value as { $ne: string }).$ne !== owner : value === owner;
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
class RateLimitError extends Error {}
mock.module('../../utils/rateLimit.ts', { namedExports: {
	RateLimitError, enforceRateLimit: async (name: string, id: string) => {
		assert.equal(name, 'recipe-sharing'); assert.equal(id, ownerId);
		if (limited) throw new RateLimitError();
	},
} });
mock.module('../../utils/emailVerification.ts', { namedExports: {
	sanitiseEmail: (value: unknown) => typeof value === 'string' ? value.trim().toLowerCase() : '',
} });
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
	findOne: ({ email }: { email: string }) => {
		userLookups.push(email);
		return { select: (fields: string) => {
			assert.ok(fields === '_id email' || fields === '_id');
			return { lean: async () => {
				if (databaseFailure) throw new Error('private database error');
				return accounts.find(user => user.email === email) ?? null;
			} };
		} };
	},
	find: (filter: { _id: { $in: string[] } }) => ({ select: (fields: string) => {
		assert.equal(fields, '_id email');
		return { lean: async () => accounts.filter(user => filter._id.$in.some(id => String(id) === user._id.toString())) };
	} }),
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
	find: (filter: Record<string, unknown>) => {
		const query = { select: () => query, populate: () => query, lean: async () => matches(filter) ? [recipeData()] : [] };
		return query;
	},
	updateOne: async (filter: Record<string, unknown>, update: { $addToSet?: { sharedWith: unknown }; $pull?: { sharedWith: string } }) => {
		writes.push({ filter, update });
		if (!matches(filter)) return { matchedCount: 0 };
		if (update.$addToSet) sharedWith = [...new Set([...(sharedWith ?? []), String(update.$addToSet.sharedWith)])];
		if (update.$pull) sharedWith = (sharedWith ?? []).filter(id => id !== update.$pull!.sharedWith);
		return { matchedCount: 1 };
	},
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
for (const name of ['RecipeCard', 'HomeButton', 'RecipeNotFound', 'EditRecipeButton', 'DeleteRecipeButton', 'BookmarkButton', 'RecipeOverviewCard', 'BookmarkRecipeCard', 'UserDetails', 'RecipesClient', 'RecipeSearchForm', 'BackToHomeButton']) {
	mock.module(`../../components/${name}.jsx`, { defaultExport: name });
}
mock.module('../../components/RecipeSharing.tsx', { defaultExport: 'RecipeSharing' });
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
const { lookupSharingRecipient, getSharingRecipients, grantRecipeAccess, revokeRecipeAccess } = await import('../../app/actions/recipeSharing');
const { default: RecipesPage } = await import('../../app/recipes/page.jsx');

function elements(node: React.ReactNode): ReactElement<Record<string, unknown>>[] {
	if (Array.isArray(node)) return node.flatMap(elements);
	if (!React.isValidElement<Record<string, unknown>>(node)) return [];
	return [node, ...elements(node.props.children as React.ReactNode)];
}
const render = (id = recipeId) => RecipeDetailPage({ params: Promise.resolve({ id }) });
beforeEach(() => {
	viewer = { id: ownerId }; owner = ownerId; queries = [];
	sharedWith = [sharedId]; bookmarks = []; writes = []; imageDeletes = 0; saves = 0;
	userLookups = []; limited = false; databaseFailure = false;
});

test('exact normalized lookup returns only ID/email and reports already shared', async () => {
	sharedWith = [];
	assert.deepEqual(await lookupSharingRecipient(recipeId, ' Recipient@Example.com '), {
		status: 'ready', recipient: { id: sharedId, email: 'recipient@example.com' },
	});
	assert.deepEqual(userLookups, ['recipient@example.com']);
	sharedWith = [sharedId];
	assert.equal((await lookupSharingRecipient(recipeId, 'recipient@example.com')).status, 'already_shared');
});
test('unknown email is unregistered, partial/malformed inputs disclose no users', async () => {
	assert.deepEqual(await lookupSharingRecipient(recipeId, 'unknown@example.com'), { status: 'unregistered', email: 'unknown@example.com' });
	for (const input of ['recipient', 'recipient@', '', { email: 'recipient@example.com' }, 'a'.repeat(255) + '@example.com']) {
		assert.equal((await lookupSharingRecipient(recipeId, input)).status, 'invalid_email');
	}
	assert.deepEqual(userLookups, ['unknown@example.com']);
	assert.deepEqual(writes, []);
});
for (const id of [sharedId, otherId, null]) {
	test(`sharing management denies non-owner ${id}`, async () => {
		viewer = id ? { id } : null;
		assert.equal((await lookupSharingRecipient(recipeId, 'other@example.com')).status, 'unavailable');
		assert.equal((await getSharingRecipients(recipeId)).status, 'unavailable');
		assert.equal((await grantRecipeAccess(recipeId, 'other@example.com')).status, 'unavailable');
		assert.equal((await revokeRecipeAccess(recipeId, id === sharedId ? otherId : sharedId)).status, 'unavailable');
		assert.deepEqual(userLookups, []); assert.deepEqual(writes, []);
	});
}
test('grant is idempotent, stores only recipient ID, preserves owner and enables reading', async () => {
	sharedWith = undefined;
	for (let i = 0; i < 2; i++) assert.deepEqual(await grantRecipeAccess(recipeId, 'recipient@example.com'), { status: 'shared' });
	assert.deepEqual(sharedWith, [sharedId]); assert.equal(owner, ownerId);
	for (const write of writes) {
		assert.deepEqual(write.filter, { _id: recipeId, user: ownerId });
		assert.deepEqual(Object.keys(write.update as object), ['$addToSet']);
	}
	viewer = { id: sharedId };
	assert.ok(elements(await render()).some(e => e.type === 'RecipeCard'));
});
test('self, unknown and forged recipient inputs never grant access', async () => {
	assert.equal((await lookupSharingRecipient(recipeId, 'owner@example.com')).status, 'self');
	assert.equal((await grantRecipeAccess(recipeId, 'owner@example.com')).status, 'self');
	assert.equal((await grantRecipeAccess(recipeId, 'unknown@example.com')).status, 'unregistered');
	assert.equal((await grantRecipeAccess(recipeId, { id: sharedId, email: 'recipient@example.com', owner: ownerId })).status, 'invalid_email');
	assert.equal((await grantRecipeAccess('invalid', 'recipient@example.com')).status, 'unavailable');
	assert.deepEqual(writes, []);
});
test('recipient list omits deleted IDs and private fields; legacy list is empty', async () => {
	sharedWith = [sharedId, 'ffffffffffffffffffffffff'];
	assert.deepEqual(await getSharingRecipients(recipeId), { status: 'recipients', recipients: [{ id: sharedId, email: 'recipient@example.com' }] });
	sharedWith = undefined;
	assert.deepEqual(await getSharingRecipients(recipeId), { status: 'recipients', recipients: [] });
});
test('lookup/grant rate limit and unexpected failures return safe states without writes', async () => {
	limited = true;
	assert.equal((await lookupSharingRecipient(recipeId, 'recipient@example.com')).status, 'rate_limited');
	assert.equal((await grantRecipeAccess(recipeId, 'recipient@example.com')).status, 'rate_limited');
	assert.deepEqual(userLookups, []);
	limited = false; databaseFailure = true;
	assert.deepEqual(await lookupSharingRecipient(recipeId, 'recipient@example.com'), { status: 'error' });
	assert.deepEqual(writes, []);
});
test('revoke is owner-scoped/idempotent and removes detail, bookmark and shared-list access', async () => {
	bookmarks = [recipeId]; viewer = { id: sharedId };
	const sharedList = async () => elements(await RecipesPage()).find(e => e.props.heading === 'Shared with me')!.props.recipes;
	assert.equal((await sharedList() as unknown[]).length, 1);
	assert.equal((elements(await RecipesPage()).find(e => e.props.heading === 'My Recipes')!.props.recipes as unknown[]).length, 0);
	viewer = { id: otherId }; assert.equal((await sharedList() as unknown[]).length, 0);
	viewer = { id: ownerId };
	assert.equal((await sharedList() as unknown[]).length, 0);
	assert.equal((elements(await RecipesPage()).find(e => e.props.heading === 'My Recipes')!.props.recipes as unknown[]).length, 1);
	for (let i = 0; i < 2; i++) assert.deepEqual(await revokeRecipeAccess(recipeId, sharedId), { status: 'revoked' });
	assert.deepEqual(writes[0], { filter: { _id: recipeId, user: ownerId }, update: { $pull: { sharedWith: sharedId } } });
	assert.deepEqual(bookmarks, [recipeId]); assert.equal(owner, ownerId);
	viewer = { id: sharedId };
	assert.equal((await render()).type, 'RecipeNotFound');
	assert.equal((await sharedList() as unknown[]).length, 0);
	assert.ok(!JSON.stringify(await ProfilePage()).includes('Private soup'));
	await deleteBookmark(recipeId); assert.equal(bookmarks.length, 0);
});

test('owner can view recipe and keeps edit/delete controls', async () => {
	const tree = elements(await render());
	for (const type of ['RecipeCard', 'EditRecipeButton', 'DeleteRecipeButton', 'RecipeSharing']) {
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
	assert.ok(!tree.some(e => ['EditRecipeButton', 'DeleteRecipeButton', 'RecipeSharing'].includes(String(e.type))));
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
