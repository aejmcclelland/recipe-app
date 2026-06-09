import 'server-only';

import { isIP } from 'node:net';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

type HeaderReader = {
	get(name: string): string | null;
};

type RateLimitName =
	| 'auth'
	| 'password-reset'
	| 'recipe-import'
	| 'recipe-create';

type RateLimitConfig = {
	limit: number;
	window: '15 m' | '1 h';
	message: string;
};

const RATE_LIMITS: Record<RateLimitName, RateLimitConfig> = {
	auth: {
		limit: 10,
		window: '15 m',
		message: 'Too many attempts. Please try again later.',
	},
	'password-reset': {
		limit: 3,
		window: '1 h',
		message: 'Too many attempts. Please try again later.',
	},
	'recipe-import': {
		limit: 10,
		window: '1 h',
		message: 'Too many recipe import attempts. Please try again later.',
	},
	'recipe-create': {
		limit: 20,
		window: '1 h',
		message: 'Too many recipes created. Please try again later.',
	},
};

const limiters = new Map<RateLimitName, Ratelimit>();
const developmentHits = new Map<string, number[]>();
let redis: Redis | null = null;
let warnedAboutFallback = false;

export class RateLimitError extends Error {
	readonly statusCode = 429;

	constructor(message: string) {
		super(message);
		this.name = 'RateLimitError';
	}
}

export class RateLimitUnavailableError extends Error {
	readonly statusCode = 503;

	constructor() {
		super('This action is temporarily unavailable. Please try again later.');
		this.name = 'RateLimitUnavailableError';
	}
}

function getWindowMs(window: RateLimitConfig['window']) {
	return window === '15 m' ? 15 * 60 * 1000 : 60 * 60 * 1000;
}

function getLimiter(name: RateLimitName): Ratelimit | null {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;

	if (!url || !token) {
		if (process.env.NODE_ENV === 'production') {
			throw new RateLimitUnavailableError();
		}

		if (!warnedAboutFallback) {
			console.warn(
				'Upstash rate-limit environment variables are missing; using an in-memory development fallback.'
			);
			warnedAboutFallback = true;
		}

		return null;
	}

	const existing = limiters.get(name);
	if (existing) return existing;

	redis ??= new Redis({ url, token });
	const config = RATE_LIMITS[name];
	const limiter = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(config.limit, config.window),
		analytics: false,
		prefix: `rebekahs-recipes:${name}`,
	});

	limiters.set(name, limiter);
	return limiter;
}

function checkDevelopmentLimit(name: RateLimitName, identifier: string) {
	const config = RATE_LIMITS[name];
	const key = `${name}:${identifier}`;
	const cutoff = Date.now() - getWindowMs(config.window);
	const recentHits = (developmentHits.get(key) ?? []).filter(
		(timestamp) => timestamp > cutoff
	);

	if (recentHits.length >= config.limit) {
		throw new RateLimitError(config.message);
	}

	recentHits.push(Date.now());
	developmentHits.set(key, recentHits);
}

export function getClientIp(requestHeaders: HeaderReader): string {
	const forwardedFor =
		requestHeaders.get('x-vercel-forwarded-for') ??
		requestHeaders.get('x-forwarded-for');
	const candidates = [
		forwardedFor?.split(',')[0]?.trim(),
		requestHeaders.get('x-real-ip')?.trim(),
	];

	return candidates.find((candidate) => candidate && isIP(candidate)) ?? 'unknown';
}

export async function getRequestIp(requestHeaders?: HeaderReader) {
	const currentHeaders = requestHeaders ?? (await headers());
	return getClientIp(currentHeaders);
}

export async function enforceRateLimit(
	name: RateLimitName,
	identifier: string
) {
	const safeIdentifier = identifier.trim() || 'unknown';
	const limiter = getLimiter(name);

	if (!limiter) {
		checkDevelopmentLimit(name, safeIdentifier);
		return;
	}

	let result;
	try {
		result = await limiter.limit(safeIdentifier);
	} catch (error) {
		console.error('Rate-limit check failed:', error);
		throw new RateLimitUnavailableError();
	}

	if (!result.success) {
		throw new RateLimitError(RATE_LIMITS[name].message);
	}
}
