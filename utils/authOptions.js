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
import dbConnect from '@/config/database'; // Ensure DB connection setup

export const authOptions = {
	providers: [
		GoogleProvider.default({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope: 'openid email profile', // This will include the user's email and profile data
				},
			},
			profile(profile) {
				return {
					id: profile.sub,
					email: profile.email,
					firstName: profile.given_name,
					lastName: profile.family_name,
					image: profile.picture, // Optional profile image from Google
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
		async signIn({ user, account, profile }) {
			await dbConnect();

			const existingUser = await User.findOne({ email: profile.email });

			if (existingUser) {
				if (
					existingUser.authProvider !== 'google' &&
					account.provider === 'google'
				) {
					// Redirect to the sign-in page with an error message in the query parameters
					return `/recipes/signin?error=account_exists`;
				}

				user.id = existingUser._id;
				return true;
			}

			const newUser = await User.create({
				email: profile.email,
				firstName: profile.given_name,
				lastName: profile.family_name,
				image: profile.picture,
				authProvider: 'google',
			});

			user.id = newUser._id;
			return true;
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
		callbackUrl: '/', // Directs to your custom sign-in page
	},
};
