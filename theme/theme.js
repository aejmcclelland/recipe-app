'use client';
import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const theme = createTheme({
	breakpoints: {
		values: {
			mobile: 0, // Custom breakpoint for mobile
			tablet: 640, // Custom breakpoint for tablet
			laptop: 1024, // Custom breakpoint for laptop
			desktop: 1200, // Custom breakpoint for desktop
		},
	},
	palette: {
		primary: {
			main: '#FFB6B9', // Friendly soft pink color
		},
		secondary: {
			main: '#FEE9B2', // Complementary light yellow
		},
		background: {
			default: '#ffffff', // Set default background to white
		},
	},
	typography: {
		fontFamily: 'Archivo Black, Arial, sans-serif', // Default font for body text
		h6: {
			fontSize: '2rem',
			fontWeight: 700,
		},
		h6: {
			fontFamily: 'Shadows Into Light',
			fontSize: '2rem',
			fontWeight: 400,
			display: 'inline', // Display inline to combine "Rebekah" and "Recipes" seamlessly
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
