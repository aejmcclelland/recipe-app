// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import User from '@/models/User';
// import dbConnect from '@/config/database'; // Ensure DB connection setup

// export const authOptions = {
// 	providers: [
// 		GoogleProvider.default({
// 			clientId: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 		}),

// 		CredentialsProvider.default({
// 			name: 'Credentials',
// 			credentials: {
// 				email: { label: 'Email', type: 'text' },
// 				password: { label: 'Password', type: 'password' },
// 			},
// 			async authorize(credentials) {
// 				await dbConnect();
// 				const user = await User.findOne({ email: credentials.email });
// 				if (user && (await user.comparePassword(credentials.password))) {
// 					return { id: user._id, email: user.email, name: user.name };
// 				}
// 				return null; // Return null if login failed
// 			},
// 		}),
// 	],
// 	session: {
// 		strategy: 'jwt',
// 	},
// 	callbacks: {
// 		async session({ session, token }) {
// 			session.user = token.user;
// 			return session;
// 		},
// 		async jwt({ token, user }) {
// 			if (user) token.user = user;
// 			return token;
// 		},
// 	},
// 	pages: {
// 		signIn: '/recipes/signin',
// 		callbackUrl: '/', // Directs to your custom sign-in page
// 	},
// };
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import dbConnect from '@/config/database';

export const authOptions = {
	providers: [
		GoogleProvider.default({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope: 'openid email profile',
					prompt: 'select_account', // Prompts Google for account selection each time
				},
			},
			profile(profile) {
				return {
					id: profile.sub,
					email: profile.email,
					firstName: profile.given_name,
					lastName: profile.family_name,
					image: profile.picture,
				};
			},
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

				// If user exists and password matches, allow sign-in
				if (user && (await user.comparePassword(credentials.password))) {
					return { id: user._id, email: user.email, name: user.name };
				}

				// If user doesn't exist, return null to indicate failed login
				return null;
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			await dbConnect();

			const existingUser = await User.findOne({ email: profile.email });

			if (existingUser) {
				// For Google sign-in, if user exists, log in without error
				user.id = existingUser._id;
				return true;
			} else if (account.provider === 'google') {
				// For new Google users, create and allow sign-in
				const newUser = await User.create({
					email: profile.email,
					firstName: profile.given_name,
					lastName: profile.family_name,
					image: profile.picture,
					authProvider: 'google',
				});
				user.id = newUser._id;
				return true;
			}

			return false; // Block any other unexpected cases
		},
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
		error: '/recipes/register?error=account_exists', // Redirects to register page if an error occurs
		callbackUrl: '/', // Homepage after successful sign-in
	},
};
