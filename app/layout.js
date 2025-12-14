import { Box, Container } from '@mui/material';
import Appbar from '../components/Appbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import { FilterProvider } from '@/context/FilterContext';
import { archivo } from '@/app/fonts/fonts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ThemeRegistry from './ThemeRegistry';
import '../assets/globals.css';
import '../assets/google-button.css';

export const metadata = {
	title: " Welcome to Rebekah's Recipes!",
	description: 'A collection of family recipes for easy access.',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en' className={archivo.className}>
			<head>
				<meta charSet='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<link rel='canonical' href='https://rebekahsrecipes.com/' />
				<meta property='og:url' content='https://rebekahsrecipes.com/' />
				<meta property='og:title' content='Rebekah’s Recipes' />
				<meta
					property='og:description'
					content='Recipe-sharing app with Google auth, bookmarking and Cloudinary uploads.'
				/>
				<meta
					property='og:image'
					content='https://rebekahsrecipes.com/og-image.jpg'
				/>
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='627' />
				<meta name='description' content={metadata.description} />
				<title>{metadata.title}</title>
			</head>
			<body className={archivo.className}>
				<ThemeRegistry>
					<AuthProvider>
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
					</AuthProvider>
				</ThemeRegistry>
			</body>
		</html>
	);
}
