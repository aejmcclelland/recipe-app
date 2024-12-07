import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import dbConnect from '@/config/database';
import type { AuthOptions } from 'next-auth/core/types'; // Import type explicitly

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope: 'openid email profile',
					prompt: 'select_account',
				},
			},
			profile(profile) {
				return {
					id: profile.sub,
					email: profile.email,
					name: `${profile.given_name} ${profile.family_name}`,
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
		async jwt({ token, user }) {
			if (user) {
				token.user = {
					id: user.id.toString(), // Include the id field
					email: user.email,
					name: user.name,
					image: user.image,
				};
			}
			return token;
		},
		async session({ session, token }) {
			if (token.user) {
				session.user = token.user; // Pass the user object, including the id
			}
			return session;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		error: '/recipes/register?error=account_exists',
	},
};
