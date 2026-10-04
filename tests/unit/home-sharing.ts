import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { registerHooks } from 'node:module';
import { setSelectedCategory } from '../fixtures/home-filter-context';

const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const recipientId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const otherId = 'cccccccccccccccccccccccc';
const owned = { _id: '111111111111111111111111', name: 'Owned soup', user: ownerId, category: { name: 'Soup' } };
const shared = { _id: '222222222222222222222222', name: 'Shared curry', user: otherId, category: { name: 'Curry' } };
let viewer: string | null;
let shareForOwner: boolean;
let ownedQueries: string[];
let sharedQueries: string[];

mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../models/Recipe.ts', { defaultExport: {
	find: ({ user }: { user: string }) => {
		ownedQueries.push(user);
		const query = { populate: () => query, lean: async () => viewer === ownerId && user === ownerId ? [owned] : [] };
		return query;
	},
} });
mock.module('../../models/Category.js', { defaultExport: { find: () => ({ lean: async () => [
	{ _id: '333333333333333333333333', name: 'Soup' },
	{ _id: '444444444444444444444444', name: 'Curry' },
] }) } });
mock.module('../../utils/getSessionUser.ts', { namedExports: {
	getSessionUser: async () => viewer ? { id: viewer, name: 'Recipe Tester' } : null,
} });
mock.module('../../utils/recipeAccess.ts', { namedExports: {
	getSharedRecipesForViewer: async (id: string) => {
		sharedQueries.push(id);
		return (viewer === recipientId && id === recipientId) || (viewer === ownerId && shareForOwner) ? [shared] : [];
	},
} });
mock.module('next/headers', { namedExports: { headers: async () => new Headers() } });
for (const name of ['SearchBar', 'CategoryFilterSection', 'Hero', 'WelcomeSection']) {
	mock.module(`../../components/${name}.jsx`, { defaultExport: () => React.createElement('div', { 'data-testid': name }) });
}
registerHooks({ resolve(specifier, context, nextResolve) {
	return nextResolve(specifier === '@/context/FilterContext'
		? new URL('../fixtures/home-filter-context.ts', import.meta.url).href
		: specifier, context);
} });
mock.module('../../components/RecipeOverviewCard.jsx', { defaultExport: ({ recipe }: { recipe: { _id: string; name: string; sharedWith?: unknown } }) => {
	assert.equal('sharedWith' in recipe, false);
	return React.createElement('article', { 'data-recipe-id': recipe._id }, recipe.name);
} });
const element = ({ children, component, ...props }: { children?: React.ReactNode; component?: string; 'aria-label'?: string }) =>
	React.createElement(component ?? 'div', { 'aria-label': props['aria-label'] }, children);
mock.module('@mui/material', { namedExports: { Box: element, Container: element, Typography: element } });
mock.module('@mui/material/Grid', { defaultExport: element });
Object.assign(globalThis, { React });
const { default: Home } = await import('../../app/page.jsx');

async function html() {
	return renderToStaticMarkup(await Home());
}

beforeEach(() => {
	viewer = ownerId;
	shareForOwner = false;
	setSelectedCategory('All');
	ownedQueries = [];
	sharedQueries = [];
});

test('owner sees their owned recipe and keeps the existing homepage layout without shares', async () => {
	const page = await html();
	assert.match(page, /Owned soup/);
	assert.doesNotMatch(page, /Shared with me/);
	assert.doesNotMatch(page, /Shared curry/);
	assert.deepEqual(ownedQueries, [ownerId]);
	assert.deepEqual(sharedQueries, [ownerId]);
});

test('recipient with no owned recipes sees a separate shared collection and add/import options', async () => {
	viewer = recipientId;
	const page = await html();
	assert.match(page, /My Recipes/);
	assert.match(page, /Shared with me/);
	assert.match(page, /Shared curry/);
	assert.match(page, /You have not added any recipes of your own yet/);
	assert.match(page, /data-testid="Hero"/);
	assert.deepEqual(ownedQueries, [recipientId]);
	assert.deepEqual(sharedQueries, [recipientId]);
});

test('owned and shared recipes render in separate sections when both exist', async () => {
	shareForOwner = true;
	const page = await html();
	assert.match(page, /<section aria-label="My Recipes">[\s\S]*Owned soup[\s\S]*<section aria-label="Shared with me">[\s\S]*Shared curry/);
	assert.deepEqual(sharedQueries, [ownerId]);
});

test('category filter applies to both collections', async () => {
	shareForOwner = true;
	setSelectedCategory('Soup');
	let page = await html();
	assert.match(page, /<article[^>]*>Owned soup/);
	assert.doesNotMatch(page, /<article[^>]*>Shared curry/);
	assert.match(page, /No shared recipes found for this category/);
	setSelectedCategory('Curry');
	page = await html();
	assert.doesNotMatch(page, /<article[^>]*>Owned soup/);
	assert.match(page, /No recipes found for this category/);
	assert.match(page, /<article[^>]*>Shared curry/);
});

test('signed-in user without owned or shared recipes retains the get-started view', async () => {
	viewer = otherId;
	const page = await html();
	assert.match(page, /data-testid="Hero"/);
	assert.doesNotMatch(page, /Shared with me/);
	assert.doesNotMatch(page, /<article\b/);
});
