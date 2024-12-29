import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import dbConnect from '@/config/database';
import type { AuthOptions } from 'next-auth/core/types';

// Extend the GoogleProfile interface
interface CustomGoogleProfile extends GoogleProfile {
	picture: string; // Ensure we can access the profile picture
}

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider<CustomGoogleProfile>({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope: 'openid email profile',
					prompt: 'select_account',
				},
			},
			profile(profile: CustomGoogleProfile) {
				return {
					id: profile.sub, // Google's unique identifier
					email: profile.email,
					name: profile.name, // Use the full name provided by Google
					image: profile.picture, // Correctly typed `picture` property
				};
			},
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				await dbConnect();
				const user = await User.findOne({ email: credentials?.email });

				if (user && (await user.comparePassword(credentials?.password))) {
					return {
						id: user._id.toString(),
						email: user.email,
						name: `${user.firstName} ${user.lastName}`,
						image: user.image,
					};
				}

				return null;
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account.provider === 'google' && profile) {
				await dbConnect();

				// Check if user exists in MongoDB
				let existingUser = await User.findOne({ email: profile.email });

				// Create a new user if not found
				if (!existingUser) {
					existingUser = await User.create({
						email: profile.email,
						name: profile.name, // Full name from Google
						image: (profile as CustomGoogleProfile).picture, // Google profile picture
						authProvider: 'google',
					});
				}

				// Map MongoDB _id to `user.id`
				user.id = existingUser._id.toString();
			}

			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				// Store essential fields in the token
				token.user = {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			}
			return token;
		},
		async session({ session, token }) {
			if (token.user) {
				// Attach user data from token to the session
				session.user = token.user;
			}
			return session;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/register?error=account_exists',
	},
};
