import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { createRequire } from 'node:module';

// Match the repository's reporting script for Mongoose's CommonJS exports.
const require = createRequire(import.meta.url);
const Recipe = require('../../models/Recipe.ts').default as typeof import('../../models/Recipe').default;

test('new and legacy recipes default to no shared users and retain one owner', () => {
	const user = new mongoose.Types.ObjectId();
	for (const recipe of [new Recipe({ user }), Recipe.hydrate({ user })]) {
		assert.equal(recipe.user.toString(), user.toString());
		assert.equal(recipe.sharedWith.length, 0);
	}
});

test('sharing stores User ObjectIds, is excluded by default, and both access paths have indexes', () => {
	const recipient = new mongoose.Types.ObjectId();
	const recipe = new Recipe({ sharedWith: [recipient.toString()] });
	assert.ok(recipe.sharedWith[0] instanceof mongoose.Types.ObjectId);
	assert.equal(recipe.sharedWith[0].toString(), recipient.toString());
	const path = Recipe.schema.path('sharedWith');
	assert.equal(path.options.select, false);
	assert.equal(path.options.type[0].ref, 'User');
	const indexes = Recipe.schema.indexes().map(([fields]) => fields);
	assert.ok(indexes.some(fields => fields.user === 1));
	assert.ok(indexes.some(fields => fields.sharedWith === 1));
});
