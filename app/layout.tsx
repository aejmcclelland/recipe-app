import { Box, Container } from '@mui/material';
import Appbar from '../components/Appbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import { FilterProvider } from '@/context/FilterContext';
import { archivo } from '@/app/fonts/fonts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import ThemeRegistry from './ThemeRegistry';
import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import '../assets/globals.css';
import '../assets/google-button.css';

const siteUrl = 'https://www.rebekahsrecipes.com';
const siteDescription =
	'Save your own recipes, import recipes from supported sites like BBC Good Food and Jamie Oliver, and edit them to build your own digital recipe collection.';

export const metadata = {
	metadataBase: new URL(siteUrl),
	applicationName: "Rebekah's Recipes",
	title: {
		default: "Rebekah's Recipes | Personal Recipe Manager",
		template: "%s | Rebekah's Recipes",
	},
	description: siteDescription,
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: "Rebekah's Recipes | Personal Recipe Manager",
		description: siteDescription,
		url: siteUrl,
		siteName: "Rebekah's Recipes",
		type: 'website',
		locale: 'en_GB',
	},
	twitter: {
		card: 'summary',
		title: "Rebekah's Recipes | Personal Recipe Manager",
		description: siteDescription,
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport = {
	width: 'device-width',
	initialScale: 1,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	// Seed the client session so theme selection is correct on the first render.
	// This reads the existing JWT session and does not query user data.
	const session = await getServerSession(authOptions);

	return (
		<html lang='en' className={archivo.className}>
			<body className={archivo.className}>
				<AuthProvider session={session}>
					<ThemeRegistry>
						<ToastContainer autoClose={3000} position='top-right' />
						<FilterProvider>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									minHeight: '100vh',
								}}>
								<Appbar />
								<Container sx={{ flex: 1, py: 3 }}>{children}</Container>
								<Footer />
							</Box>
						</FilterProvider>
						<SpeedInsights />
						<Analytics />
					</ThemeRegistry>
				</AuthProvider>
			</body>
		</html>
	);
}
