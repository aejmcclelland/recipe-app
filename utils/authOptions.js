import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import dbConnect from '@/config/database'; // Ensure DB connection setup

export const authOptions = {
	providers: [
		GoogleProvider.default({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),

		CredentialsProvider.default({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				await dbConnect();
				const user = await User.findOne({ email: credentials.email });
				if (user && (await user.comparePassword(credentials.password))) {
					return { id: user._id, email: user.email, name: user.name };
				}
				return null; // Return null if login failed
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ session, token }) {
			session.user = token.user;
			return session;
		},
		async jwt({ token, user }) {
			if (user) token.user = user;
			return token;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		callbackUrl: '/', // Directs to your custom sign-in page
	},
};
