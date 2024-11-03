// Description: Configuration for NextAuth.js authentication providers and callbacks.
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

			if (account.provider === 'google') {
				// Find existing user or create one
				let existingUser = await User.findOne({ email: profile.email });
				if (!existingUser) {
					existingUser = await User.create({
						email: profile.email,
						firstName: profile.given_name,
						lastName: profile.family_name,
						image: profile.picture,
						authProvider: 'google',
					});
				}
				user.id = existingUser._id; // Link session to database user ID
			} else if (account.provider === 'credentials') {
				// For credential-based login, find the user and return ID
				const existingUser = await User.findOne({ email: user.email });
				if (existingUser) {
					user.id = existingUser._id;
				} else {
					throw new Error('User not found, please register first.');
				}
			}
			return true;
		},
		async session({ session, token }) {
			if (token.user) {
				session.user = token.user; // Persist user data in the session
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.user = {
					id: user.id,
					email: user.email,
					name: user.name || `${user.firstName} ${user.lastName}`, // For Google or credential logins
					image: user.image,
				};
			}
			return token;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/register?error=account_exists', // Redirects to register page if an error occurs
		callbackUrl: '/', // Homepage after successful sign-in
	},
};
