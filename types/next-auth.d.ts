import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// ✅ Extend NextAuth Session
declare module 'next-auth' {
	interface Session {
		user: {
			id: string; // ✅ Ensure `id` is included
			name?: string;
			email?: string;
			image?: string;
		} & DefaultSession['user'];
		bookmarks?: string[]; // ✅ Add bookmarks here
	}

	interface User {
		id: string;
		name?: string;
		email?: string;
		image?: string;
	}
}

// ✅ Extend JWT to include `id`
declare module 'next-auth/jwt' {
	interface JWT {
		user: {
			id: string; // ✅ Ensure `id` exists in `token.user`
			name?: string;
			email?: string;
			image?: string;
		};
		bookmarks?: string[];
	}
}
