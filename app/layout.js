import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Appbar from '../components/Appbar';
import '../assets/globals.css';

export const metadata = {
	title: "Rebekah's Recipes",
	description: 'A collection of family recipes for easy access.',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<head>
				{/* Link to Google Fonts */}
				<link
					href='https://fonts.googleapis.com/css2?family=Archivo+Black&family=Shadows+Into+Light&display=swap"'
					rel='stylesheet'
				/>
			</head>
			<body>
				<ThemeProvider theme={theme}>
					<CssBaseline /> {/* Ensures consistent baseline styling */}
					<Appbar /> {/* AppBar component */}
					{children} {/* Main content */}
				</ThemeProvider>
			</body>
		</html>
	);
}
