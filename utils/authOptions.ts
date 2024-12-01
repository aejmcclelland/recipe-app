import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import dbConnect from '@/config/database';

export const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: 'openid email profile',
					prompt: 'select_account',
				},
			},
			profile(profile) {
				// Returning custom profile fields
				return {
					id: profile.sub,
					email: profile.email,
					name: profile.name,
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
			await dbConnect();

			if (account.provider === 'google') {
				let existingUser = await User.findOne({ email: profile?.email });
				if (!existingUser) {
					existingUser = await User.create({
						email: profile?.email,
						firstName: profile?.given_name,
						lastName: profile?.family_name,
						image: profile?.picture,
						authProvider: 'google',
					});
				}
				user.id = existingUser._id.toString();
			}
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
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
			session.user = token.user;
			return session;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/register?error=account_exists',
	},
};
