import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose, { Schema } from 'mongoose';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('hot-reloaded legacy Recipe models gain the sharing field before updates run', () => {
	mongoose.deleteModel(/Recipe/);
	const legacyRecipe = mongoose.model('Recipe', new Schema({
		user: { type: Schema.Types.ObjectId, required: true },
	}));

	const Recipe = require('../../models/Recipe.ts').default as typeof import('../../models/Recipe').default;
	assert.notEqual(Recipe, legacyRecipe);
	assert.ok(Recipe.schema.path('sharedWith'));

	const recipient = new mongoose.Types.ObjectId();
	const recipe = new Recipe({ user: new mongoose.Types.ObjectId(), sharedWith: [recipient] });
	assert.equal(recipe.sharedWith[0]?.toString(), recipient.toString());
});
