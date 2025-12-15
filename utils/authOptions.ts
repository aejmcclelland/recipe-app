// utils/authOptions.ts
import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

import connectDB from '@/config/database';
import User from '@/models/User';

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			authorization: {
				params: {
					scope: 'openid email profile',
					prompt: 'select_account',
				},
			},
			profile(profile) {
				const picture =
					(profile as { picture?: string }).picture ??
					(profile as { image?: string }).image ??
					null;

				return {
					id: (profile as any).sub,
					email: profile.email,
					name: profile.name,
					image: picture,
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

				const email = credentials.email.trim().toLowerCase();
				const user = await User.findOne({ email });
				if (!user) return null;

				const isMatch = await user.comparePassword(credentials.password);
				if (!isMatch) return null;

				// Block sign-in until the user's email is verified.
				// Do this after password validation to avoid leaking account state.
				if (!user.emailVerified) {
					return Promise.reject(new Error('EMAIL_NOT_VERIFIED'));
				}

				return {
					id: user._id.toString(),
					email: user.email,
					name: `${user.firstName} ${user.lastName}`,
					image: user.image,
				};
			},
		}),
	],

	session: {
		strategy: 'jwt',
	},

	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === 'google' && profile?.email) {
				await connectDB();

				const email = profile.email.trim().toLowerCase();
				let existingUser = await User.findOne({ email });

				// If the email already exists as a credentials user, don't let Google create a duplicate.
				if (
					existingUser &&
					existingUser.authProvider &&
					existingUser.authProvider !== 'google'
				) {
					return '/recipes/signin';
				}

				if (!existingUser) {
					const [firstName, ...rest] = (profile.name ?? 'User').split(' ');

					existingUser = await User.create({
						email,
						firstName,
						lastName: rest.join(' ') || 'Unknown',
						image: (profile as any).picture,
						authProvider: 'google',
						emailVerified: new Date(),
					});
				} else if (!existingUser.emailVerified) {
					// Google is a verified identity provider; mark as verified if missing.
					existingUser.emailVerified = new Date();
					await existingUser.save();
				}

				(user as any).id = existingUser._id.toString();
			}

			return true;
		},

		async jwt({ token, user, trigger, session }) {
			// Initial sign-in
			if (user && (user as any).id) {
				token.user = {
					id: (user as any).id,
					email: user.email,
					name: user.name,
					image: user.image,
				};
			}

			// ✅ Allow client-side `useSession().update()` to refresh token values
			if (trigger === 'update' && session?.user && token.user) {
				token.user.name = session.user.name ?? token.user.name;
				token.user.email = session.user.email ?? token.user.email;
				token.user.image = session.user.image ?? token.user.image;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user && token?.user) {
				session.user.id = token.user.id;
				session.user.email = token.user.email;
				session.user.name = token.user.name;
				session.user.image = token.user.image;
			}

			return session;
		},
	},

	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/signin',
	},
};
