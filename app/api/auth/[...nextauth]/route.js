import NextAuthImport from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import {
	enforceRateLimit,
	getRequestIp,
	RateLimitError,
	RateLimitUnavailableError,
} from '@/utils/rateLimit';

// In some bundler/interop situations, the imported value can be a module object.
// This makes it work whether the function is the import itself or under `.default`.
const NextAuth = NextAuthImport?.default ?? NextAuthImport;

const handler = NextAuth(authOptions);

export const GET = handler;

export async function POST(request, context) {
	const { pathname } = new URL(request.url);
	const isCredentialsLogin =
		pathname.endsWith('/callback/credentials') ||
		pathname.endsWith('/signin/credentials');

	if (isCredentialsLogin) {
		try {
			await enforceRateLimit('auth', await getRequestIp(request.headers));
		} catch (error) {
			if (
				error instanceof RateLimitError ||
				error instanceof RateLimitUnavailableError
			) {
				const errorUrl = new URL('/api/auth/error', request.url);
				errorUrl.searchParams.set(
					'error',
					error instanceof RateLimitError
						? 'RATE_LIMITED'
						: 'SERVICE_UNAVAILABLE'
				);

				return Response.json(
					{ url: errorUrl.toString() },
					{ status: error.statusCode }
				);
			}
			throw error;
		}
	}

	return handler(request, context);
}
