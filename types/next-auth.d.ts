import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

// Extend NextAuth Session
declare module 'next-auth' {
	interface Session {
		user: {
			id: string; // Ensure `id` is included
		} & DefaultSession['user'];
		bookmarks?: string[]; // Add bookmarks here
	}

	interface User {
		id: string;
	}
}

// Extend JWT to include `id`
declare module 'next-auth/jwt' {
	interface JWT extends DefaultJWT {
		user?: {
			id: string;
			email?: string | null;
			name?: string | null;
			image?: string | null;
		};
		bookmarks?: string[];
	}
}
