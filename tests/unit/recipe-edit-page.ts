import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import React, { type ReactElement } from 'react';

const id = 'cccccccccccccccccccccccc';
const owner = 'aaaaaaaaaaaaaaaaaaaaaaaa';
let viewer: { id: string } | null;
let queries: unknown[];
let categoriesRead: number;
let exists: boolean;
const recipe = { _id: id, user: owner, name: 'Pasta', category: 'pasta', ingredients: [], steps: ['Cook.'], prepTime: 10, cookTime: 20, serves: 2 };
mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../utils/getSessionUser.ts', { namedExports: { getSessionUser: async () => viewer } });
mock.module('../../models/Recipe.ts', { defaultExport: {
	findOne(filter: { _id: string; user: string }) {
		queries.push(filter);
		return { populate(path: string) {
			assert.equal(path, 'ingredients.ingredient');
			return { lean: async () => exists && filter.user === owner ? recipe : null };
		} };
	},
} });
mock.module('../../models/Category.js', { defaultExport: {
	find(filter: unknown) { assert.deepEqual(filter, {}); categoriesRead++; return { lean: async () => [{ _id: 'pasta', name: 'Pasta' }] }; },
} });
for (const name of ['RecipeEditForm', 'RecipeDeleteForm', 'RecipeNotFound']) {
	mock.module(`../../components/${name}.jsx`, { defaultExport: name });
}
mock.module('next/link', { defaultExport: 'NextLink' });
mock.module('@mui/material', { namedExports: { Box: 'Box', Link: 'Link', Typography: 'Typography' } });
Object.assign(globalThis, { React });
const { default: EditPage } = await import('../../app/recipes/[id]/edit/page.jsx');
function elements(node: React.ReactNode): ReactElement<Record<string, unknown>>[] {
	if (Array.isArray(node)) return node.flatMap(elements);
	if (!React.isValidElement<Record<string, unknown>>(node)) return [];
	return [node, ...elements(node.props.children as React.ReactNode)];
}
const render = (recipeId = id) => EditPage({ params: Promise.resolve({ id: recipeId }) });
beforeEach(() => { viewer = { id: owner }; queries = []; categoriesRead = 0; exists = true; });
test('owner receives unchanged recipe/category props and a detail back link', async () => {
	const nodes = elements(await render());
	assert.deepEqual(queries, [{ _id: id, user: owner }]);
	assert.equal(categoriesRead, 1);
	assert.deepEqual(nodes.find(node => node.type === 'RecipeEditForm')!.props.recipe, recipe);
	assert.deepEqual(nodes.find(node => node.type === 'RecipeEditForm')!.props.categories, [{ _id: 'pasta', name: 'Pasta' }]);
	assert.equal(nodes.find(node => node.type === 'RecipeDeleteForm')!.props.appearance, 'edit');
	assert.equal(nodes.find(node => node.type === 'NextLink')!.props.href, `/recipes/${id}`);
});
for (const identity of [null, 'bbbbbbbbbbbbbbbbbbbbbbbb', 'eeeeeeeeeeeeeeeeeeeeeeee']) {
	test(`signed-out or non-owner receives the existing not-found component: ${identity}`, async () => {
		viewer = identity ? { id: identity } : null;
		assert.equal((await render()).type, 'RecipeNotFound');
		assert.equal(categoriesRead, 0);
	});
}
test('missing recipe and malformed ID retain not-found behaviour', async () => {
	exists = false;
	assert.equal((await render()).type, 'RecipeNotFound');
	queries = [];
	assert.equal((await render('invalid')).type, 'RecipeNotFound');
	assert.deepEqual(queries, []); assert.equal(categoriesRead, 0);
});
