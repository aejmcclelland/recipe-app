// next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
	interface User {
		id: string;
		name?: string;
		email?: string;
		image?: string;
	}

	interface Session {
		user: {
			id: string;
			name?: string;
			email?: string;
			image?: string;
		};
		bookmarks?: string[]; // Add bookmarks to the session
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		user?: {
			id: string;
			name?: string;
			email?: string;
			image?: string;
		};
		bookmarks?: string[]; // Add bookmarks to the JWT
	}
}
