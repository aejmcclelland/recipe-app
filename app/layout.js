import { ThemeProvider } from '@mui/material/styles';
import AuthProvider from '@/components/AuthProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import theme from '../theme/theme';
import Appbar from '../components/Appbar';
import '../assets/globals.css';
import { FilterProvider } from '@/context/FilterContext';
import { archivo, shadowsIntoLight } from '@/app/fonts/fonts';
import Footer from '@/components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
	title: ' Welcome to Rebekah&#39;s Recipes!',
	description: 'A collection of family recipes for easy access.',
};

export default function RootLayout({ children }) {
	return (
		<AuthProvider>
			<html lang='en' className={archivo.className}>
				<head>
					<meta charSet='UTF-8' />
					<meta
						name='viewport'
						content='width=device-width, initial-scale=1.0'
					/>
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
					<ToastContainer autoClose={3000} position='top-right' />
					<FilterProvider>
						<ThemeProvider theme={theme}>
							<CssBaseline /> {/* Ensures consistent baseline styling */}
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									minHeight: '100vh', // Full height of the viewport
								}}>
								<Appbar /> {/* AppBar component */}
								<Container sx={{ flex: 1, py: 3 }}>
									{children} {/* Main content will stretch */}
								</Container>
								<Footer /> {/* Footer component */}
							</Box>
						</ThemeProvider>
					</FilterProvider>
					<SpeedInsights />
				</body>
			</html>
		</AuthProvider>
	);
}
