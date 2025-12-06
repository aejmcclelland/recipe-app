import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
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
				// profile type here is the Google profile from NextAuth.
				// `picture` isn't in the base type, so we cast.
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

				const user = await User.findOne({ email: credentials.email });

				if (!user) return null;

				const isMatch = await user.comparePassword(credentials.password);
				if (!isMatch) return null;

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
		// Google sign-in: ensure user exists in Mongo and attach id to `user`
		async signIn({ user, account, profile }) {
			if (account?.provider === 'google' && profile?.email) {
				await connectDB();

				let existingUser = await User.findOne({ email: profile.email });

				if (!existingUser) {
					const [firstName, ...rest] = (profile.name ?? 'User').split(' ');

					existingUser = await User.create({
						email: profile.email,
						firstName,
						lastName: rest.join(' ') || 'Unknown',
						image: (profile as any).picture,
						authProvider: 'google',
					});
				}

				// Expose Mongo _id for jwt callback
				(user as any).id = existingUser._id.toString();
			}

			return true;
		},

		// Put `user` info into the JWT
		async jwt({ token, user }) {
			if (user && (user as any).id) {
				token.user = {
					id: (user as any).id,
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

		// Expose `token.user` on `session.user`
		async session({ session, token }) {
			if (session.user && token?.user) {
				session.user.id = token.user.id;
				session.user.email = token.user.email;
				session.user.name = token.user.name;
				session.user.image = token.user.image;
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
