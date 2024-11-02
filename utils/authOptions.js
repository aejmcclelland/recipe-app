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
					prompt: 'select_account',
				},
			},
			profile(profile) {
				// Customize the profile format if using Google
				return {
					id: profile.sub,
					email: profile.email,
					name: `${profile.given_name} ${profile.family_name}`,
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
				if (user && (await user.comparePassword(credentials.password))) {
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

			// Check if the user already exists in the database
			const existingUser = await User.findOne({ email: user.email });
			if (existingUser) {
				if (existingUser.authProvider !== account.provider) {
					// Redirect if the user tries to sign in with a different provider than their registered one
					return `/recipes/signin?error=account_exists`;
				}
				user.id = existingUser._id;
				return true;
			}

			// Create a new user if one does not exist
			const newUser = await User.create({
				email: user.email,
				firstName:
					account.provider === 'google'
						? profile.given_name
						: user.firstName || 'Guest',
				lastName:
					account.provider === 'google'
						? profile.family_name
						: user.lastName || '',
				image: account.provider === 'google' ? profile.picture : '',
				authProvider: account.provider,
			});
			user.id = newUser._id;
			return true;
		},
		async session({ session, token }) {
			session.user = token.user;
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
	},
	pages: {
		signIn: '/recipes/signin',
		callbackUrl: '/',
	},
};
