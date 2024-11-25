import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import dbConnect from '@/config/database';
import { NextAuthOptions } from 'next-auth';

interface GoogleProfile {
	sub: string;
	email: string;
	given_name: string;
	family_name: string;
	picture: string;
}

export const authOptions: NextAuthOptions = {
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
			profile(profile: GoogleProfile) {
				return {
					id: profile.sub,
					email: profile.email,
					firstName: profile.given_name,
					lastName: profile.family_name,
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
				await dbConnect();
				const user = await User.findOne({ email: credentials?.email });

				if (user && (await user.comparePassword(credentials?.password))) {
					return {
						id: user._id.toString(),
						email: user.email,
						name: `${user.firstName} ${user.lastName}`,
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
			await dbConnect();

			if (account.provider === 'google') {
				let existingUser = await User.findOne({ email: profile?.email });
				if (!existingUser) {
					existingUser = await User.create({
						email: (profile as GoogleProfile)?.email,
						firstName: (profile as GoogleProfile)?.given_name,
						lastName: (profile as GoogleProfile)?.family_name,
						image: (profile as GoogleProfile)?.picture,
						authProvider: 'google',
					});
				}
				user.id = existingUser._id.toString();
			} else if (account.provider === 'credentials') {
				const existingUser = await User.findOne({ email: user.email });
				if (existingUser) {
					user.id = existingUser._id.toString();
				} else {
					throw new Error('User not found, please register first.');
				}
			}
			return true;
		},
		async session({ session, token }) {
			if (token.user) {
				session.user = token.user;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.user = {
					id: user.id, // Ensure `id` is added here
					email: user.email,
					name: user.name,
					image: user.image,
					userId: user.id,
				};
			}
			return token;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/register?error=account_exists',
	},
};
