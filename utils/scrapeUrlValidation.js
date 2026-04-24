export const SUPPORTED_SCRAPE_SITES = Object.freeze({
	BBC_GOOD_FOOD: 'bbcGoodFood',
	JAMIE_OLIVER: 'jamieOliver',
	BBC_FOOD: 'bbcFood',
});

function normalizeHostname(hostname) {
	return hostname.toLowerCase().replace(/\.$/, '');
}

function matchesHostname(hostname, allowedHostname) {
	return hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`);
}

const SCRAPE_SITE_RULES = [
	{
		siteKey: SUPPORTED_SCRAPE_SITES.BBC_GOOD_FOOD,
		matches: ({ hostname }) => matchesHostname(hostname, 'bbcgoodfood.com'),
	},
	{
		siteKey: SUPPORTED_SCRAPE_SITES.JAMIE_OLIVER,
		matches: ({ hostname }) => matchesHostname(hostname, 'jamieoliver.com'),
	},
	{
		siteKey: SUPPORTED_SCRAPE_SITES.BBC_FOOD,
		matches: ({ hostname, pathname }) =>
			(hostname === 'bbc.co.uk' || hostname === 'www.bbc.co.uk') &&
			(pathname === '/food/recipes' || pathname.startsWith('/food/recipes/')),
	},
];

export function resolveSupportedScrapeTarget(rawUrl) {
	let parsedUrl;

	try {
		parsedUrl = new URL(rawUrl);
	} catch {
		throw new Error('Invalid URL');
	}

	if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
		throw new Error('Invalid URL');
	}

	if (parsedUrl.username || parsedUrl.password) {
		throw new Error('Invalid URL');
	}

	const hostname = normalizeHostname(parsedUrl.hostname);
	const pathname = parsedUrl.pathname.toLowerCase();

	const supportedSite = SCRAPE_SITE_RULES.find((rule) =>
		rule.matches({ hostname, pathname })
	);

	if (!supportedSite) {
		throw new Error('This site is not supported yet');
	}

	return {
		normalizedUrl: parsedUrl.toString(),
		siteKey: supportedSite.siteKey,
	};
}
