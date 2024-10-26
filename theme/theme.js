'use client';
import { createTheme, alpha } from '@mui/material/styles';
import { Archivo, Shadows_Into_Light } from 'next/font/google';

const archivo = Archivo({
	weight: ['100', '400', '700'],
	subsets: ['latin'],
	display: 'swap',
});

const shadowsIntoLight = Shadows_Into_Light({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
});

// Define extended color palettes for sign-in page styling
const blue = {
	50: '#F0F7FF',
	100: '#C2E0FF',
	200: '#99CCF3',
	300: '#66B2FF',
	400: '#3399FF',
	main: '#007FFF',
	500: '#007FFF',
	600: '#0072E5',
	700: '#0059B2',
	800: '#004C99',
	900: '#003A75',
};

const grey = {
	50: '#F3F6F9',
	100: '#E7EBF0',
	200: '#E0E3E7',
	300: '#CDD2D7',
	400: '#B2BAC2',
	500: '#A0AAB4',
	600: '#6F7E8C',
	700: '#3E5060',
	800: '#2D3843',
	900: '#1A2027',
};

// Updated theme with merged settings
const theme = createTheme({
	breakpoints: {
		values: {
			mobile: 0,
			tablet: 640,
			laptop: 1024,
			desktop: 1200,
		},
	},
	palette: {
		primary: {
			main: '#d32f2f', // Red primary as per existing theme
		},
		secondary: {
			main: '#FEE9B2', // Light secondary
		},
		background: {
			default: '#ffffff', // White background
		},
		common: {
			black: '#1D1D1D',
		},
		text: {
			primary: grey[900],
			secondary: grey[700],
		},
		blue, // Adding blue palette for extended use cases
		grey, // Adding grey palette for extended use cases
	},
	typography: {
		fontFamily: archivo.style.fontFamily, // Primary font family
		h1: {
			fontSize: '2.5rem',
			fontWeight: 700,
		},
		h2: {
			fontSize: '2rem',
			fontWeight: 600,
		},
		h3: {
			fontSize: '1.75rem',
			fontWeight: 500,
		},
		h4: {
			fontSize: '1.5rem',
			fontWeight: 500,
		},
		h6: {
			fontFamily: shadowsIntoLight.style.fontFamily,
			fontSize: '1.25rem',
			fontWeight: 400,
		},
		body1: {
			fontSize: '1rem',
			fontWeight: 400,
		},
		button: {
			fontSize: '1rem',
			textTransform: 'none',
			fontWeight: 700,
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: '#d32f2f',
				},
			},
		},
		MuiInputBase: {
			styleOverrides: {
				root: {
					color: '#000000',
					backgroundColor: alpha('#ffffff', 0.8),
					borderRadius: '4px',
					padding: '4px 8px',
					maxWidth: '250px',
					'& .MuiInputBase-input': {
						padding: '8px 8px 8px calc(1em + 32px)',
						transition: 'width 0.3s',
						width: '100%',
					},
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					fontSize: '1rem',
					textTransform: 'none',
					backgroundColor: '#d32f2f', // Primary button color
					color: '#ffffff',
					'&:hover': {
						backgroundColor: alpha('#d32f2f', 0.85), // Darker on hover
					},
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					color: '#ffffff',
				},
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					width: 40,
					height: 40,
					fontSize: '1.25rem',
					backgroundColor: blue[500], // Default avatar background
				},
			},
		},
	},
});

export default theme;
