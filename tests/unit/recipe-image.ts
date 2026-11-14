import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRecipeImageSrc } from '../../utils/recipeImage';

test('recipes with the old placeholder path or no image use the bundled image', () => {
	for (const image of ['/default-recipe.jpg', '', null, undefined]) {
		assert.equal(getRecipeImageSrc(image), '/images/recipes/default-recipe.jpg');
	}
});

test('saved recipe image URLs are preserved', () => {
	const uploadedImage = 'https://res.cloudinary.com/example/image/upload/recipes/pasta.jpg';
	assert.equal(getRecipeImageSrc(uploadedImage), uploadedImage);
});
