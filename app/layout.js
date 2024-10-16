import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import theme from '../theme/theme';
import Appbar from '../components/Appbar';
import '../assets/globals.css'; // Import
import { archivo, shadowsIntoLight } from '@/app/fonts/fonts';
import Footer from '@/components/Footer';

export const metadata = {
	title: ' Welcome to Rebekah&#39;s Recipes!',
	description: 'A collection of family recipes for easy access.',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en' className={archivo.className}>
			<head>
				<meta charSet='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<meta name='description' content={metadata.description} />
				<title>{metadata.title}</title>
			</head>
			<body className={archivo.className}>
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
			</body>
		</html>
	);
}
