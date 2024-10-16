'use client';
import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
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
			main: '#FFB6B9',
		},
		secondary: {
			main: '#FEE9B2',
		},
		background: {
			default: '#ffffff',
		},
	},
	typography: {
		typography: {
			fontFamily: archivo.style.fontFamily, // Default font for most content
			h6: {
				fontFamily: shadowsIntoLight.style.fontFamily, // Special font for h6 headers
			},
		},
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
			fontfamily: shadowsIntoLight.style.fontFamily,
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
		},
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: '#FFB6B9',
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
		MuiListItem: {
			styleOverrides: {
				root: {
					paddingLeft: '16px',
				},
			},
		},
	},
});

export default theme;
