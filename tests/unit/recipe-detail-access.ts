import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import React, { type ReactElement } from 'react';
import mongoose from 'mongoose';
import { registerHooks } from 'node:module';

const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const otherId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const recipeId = 'cccccccccccccccccccccccc';
let viewer: { id: string } | null;
let queries: Record<string, unknown>[];
let owner: string | null;
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
mock.module('../../models/Recipe.ts', { defaultExport: {
	findOne: (filter: Record<string, unknown>) => {
		queries.push(filter);
		let populatedOwner = false;
		const query = {
			populate: (options: string | { path: string }) => {
				if (options === 'user' || (typeof options === 'object' && options.path === 'user')) populatedOwner = true;
				return query;
			},
			lean: async () => filter._id === recipeId && filter.user === owner ? {
				_id: new mongoose.Types.ObjectId(recipeId), name: 'Private soup',
				user: populatedOwner ? privateUser : new mongoose.Types.ObjectId(owner!),
				ingredients: [], steps: ['Cook'], image: 'https://example.com/image.jpg',
			} : null,
		};
		return query;
	},
} });
// Inspect the actual page's client props without executing browser-only UI.
for (const name of ['RecipeCard', 'HomeButton', 'RecipeNotFound', 'EditRecipeButton', 'DeleteRecipeButton', 'BookmarkButton']) {
	mock.module(`../../components/${name}.jsx`, { defaultExport: name });
}
mock.module('@mui/material', { namedExports: { Box: 'Box', Typography: 'Typography', Container: 'Container' } });
// tsx uses the classic JSX runtime for this project's jsx: preserve setting.
Object.assign(globalThis, { React });
const { default: RecipeDetailPage } = await import('../../app/recipes/[id]/page.jsx');

function elements(node: React.ReactNode): ReactElement<Record<string, unknown>>[] {
	if (Array.isArray(node)) return node.flatMap(elements);
	if (!React.isValidElement<Record<string, unknown>>(node)) return [];
	return [node, ...elements(node.props.children as React.ReactNode)];
}
const render = (id = recipeId) => RecipeDetailPage({ params: Promise.resolve({ id }) });
beforeEach(() => { viewer = { id: ownerId }; owner = ownerId; queries = []; });

test('owner can view recipe and keeps edit/delete controls', async () => {
	const tree = elements(await render());
	for (const type of ['RecipeCard', 'EditRecipeButton', 'DeleteRecipeButton']) {
		assert.ok(tree.some(element => element.type === type));
	}
	assert.deepEqual(queries, [{ _id: recipeId, user: ownerId }]);
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
		const payload = JSON.stringify(recipe);
		for (const key of Object.keys(privateUser).filter(key => key !== '_id')) {
			assert.ok(!payload.includes(key), `Unexpected owner field: ${key}`);
		}
	}
});
test('missing, malformed and ownerless recipes fail closed', async () => {
	assert.equal((await render('dddddddddddddddddddddddd')).type, 'RecipeNotFound');
	assert.equal((await render('invalid')).type, 'RecipeNotFound');
	owner = null;
	assert.equal((await render()).type, 'RecipeNotFound');
});
