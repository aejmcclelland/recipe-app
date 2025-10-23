import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoose from 'mongoose';
import User from '@/models/User';
import connectDB from '@/config/database';
import type { AuthOptions } from 'next-auth';

// Extend GoogleProfile interface
interface CustomGoogleProfile extends GoogleProfile {
	picture: string;
}

if (!User || !mongoose.models.User) {
	throw new Error(
		'User model is NOT being imported correctly or models not initialized'
	);
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
					id: profile.sub,
					email: profile.email,
					name: profile.name,
					image: profile.picture,
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
				if (!credentials?.email || !credentials?.password) {
					return null;
				}
				await connectDB();
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
				if (!profile?.email) {
					return false;
				}
				await connectDB();
				let existingUser = await User.findOne({ email: profile.email });

				if (!existingUser) {
					existingUser = await User.create({
						email: profile.email,
						firstName: profile.name.split(' ')[0],
						lastName: profile.name.split(' ').slice(1).join(' ') || 'Unknown',
						image: (profile as CustomGoogleProfile).picture,
						authProvider: 'google',
					});
				}

				user.id = existingUser._id.toString();
			}

			return true;
		},
		async jwt({ token, user }) {
			if (user?.id) {
				token.user = {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			}
			if (process.env.NODE_ENV === 'development') {
				console.log('JWT Callback - token after:', token);
			}
			return token;
		},

		async session({ session, token }) {
			if (token?.user) {
				session.user = {
					id: token.user.id,
					email: token.user.email,
					name: token.user.name,
					image: token.user.image,
				};
			}
			if (process.env.NODE_ENV === 'development') {
				console.log('Session Callback - session:', session);
			}
			return session;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/register?error=account_exists',
	},
};
