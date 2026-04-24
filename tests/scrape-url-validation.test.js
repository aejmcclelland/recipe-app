import test from 'node:test';
import assert from 'node:assert/strict';

import {
	resolveSupportedScrapeTarget,
	SUPPORTED_SCRAPE_SITES,
} from '../utils/scrapeUrlValidation.js';

test('resolveSupportedScrapeTarget only allows supported recipe hosts', () => {
	assert.equal(
		resolveSupportedScrapeTarget(
			'https://www.bbcgoodfood.com/recipes/spaghetti-carbonara'
		).siteKey,
		SUPPORTED_SCRAPE_SITES.BBC_GOOD_FOOD
	);

	assert.equal(
		resolveSupportedScrapeTarget(
			'https://www.jamieoliver.com/recipes/pasta-recipes'
		).siteKey,
		SUPPORTED_SCRAPE_SITES.JAMIE_OLIVER
	);

	assert.equal(
		resolveSupportedScrapeTarget(
			'https://www.bbc.co.uk/food/recipes/roast_chicken_31580'
		).siteKey,
		SUPPORTED_SCRAPE_SITES.BBC_FOOD
	);

	assert.throws(
		() => resolveSupportedScrapeTarget('https://www.bbc.co.uk/news'),
		/This site is not supported yet/
	);

	assert.throws(
		() => resolveSupportedScrapeTarget('https://bbcgoodfood.com.evil.test/recipes'),
		/This site is not supported yet/
	);

	assert.throws(
		() => resolveSupportedScrapeTarget('http://127.0.0.1:3000/internal'),
		/This site is not supported yet/
	);

	assert.throws(
		() => resolveSupportedScrapeTarget('javascript:alert(1)'),
		/Invalid URL/
	);
});
