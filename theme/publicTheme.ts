import { createTheme, type ThemeOptions } from '@mui/material/styles';
import applicationTheme from './theme';

declare module '@mui/material/styles' {
	interface Theme {
		publicShell?: boolean;
	}
	interface ThemeOptions {
		publicShell?: boolean;
	}
}

export const publicTokens = {
	colors: {
		ivory: '#f8f5ee',
		paper: '#fffcf7',
		tint: '#f1ece2',
		charcoal: '#1a2027',
		charcoalHover: '#343b40',
		secondaryText: '#59605e',
		espresso: '#3b281f',
		accent: '#d32f2f',
		border: '#e4dccf',
	},
	fonts: { editorial: 'Georgia, "Times New Roman", serif' },
	radii: { button: 999, menu: 12, item: 8 },
} as const;

const { colors, fonts, radii } = publicTokens;
const editorialHeading = {
	fontFamily: fonts.editorial,
	fontWeight: 400,
	letterSpacing: '-0.035em',
};
const focusRing = {
	outline: `3px solid ${colors.accent}`,
	outlineOffset: 3,
};
const menuSurface = {
	backgroundColor: colors.paper,
	color: colors.charcoal,
	border: `1px solid ${colors.border}`,
	borderRadius: radii.menu,
	boxShadow: 'none',
};

const options: ThemeOptions = {
	publicShell: true,
	palette: {
		// Keep primary red for the landing's existing accent references.
		// Primary buttons receive the dark treatment below.
		background: { default: colors.ivory, paper: colors.paper },
		text: { primary: colors.charcoal, secondary: colors.secondaryText },
		divider: colors.border,
	},
	typography: {
		h1: editorialHeading,
		h2: editorialHeading,
		h3: editorialHeading,
		h4: editorialHeading,
		h5: editorialHeading,
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				'a:focus-visible, button:focus-visible': focusRing,
			},
		},
		MuiAppBar: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: () => ({
					backgroundColor: colors.ivory,
					color: colors.charcoal,
					boxShadow: 'none',
				}),
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				// Replace the legacy root override rather than inheriting its red
				// background on text and outlined buttons.
				root: () => ({
					fontSize: '1rem',
					fontWeight: 600,
					textTransform: 'none',
					minHeight: 40,
					borderRadius: radii.button,
					boxShadow: 'none',
					'&:hover': { boxShadow: 'none' },
					'&.Mui-focusVisible': focusRing,
				}),
				containedPrimary: ({ theme }) => ({
					backgroundColor: colors.charcoal,
					color: theme.palette.common.white,
					'&:hover': { backgroundColor: colors.charcoalHover },
					'&.Mui-disabled': {
						backgroundColor: theme.palette.action.disabledBackground,
						color: theme.palette.action.disabled,
					},
				}),
				outlinedPrimary: {
					color: colors.charcoal,
					borderColor: colors.border,
					'&:hover': { backgroundColor: colors.tint, borderColor: colors.charcoal },
				},
				textPrimary: {
					color: colors.charcoal,
					'&:hover': { backgroundColor: colors.tint },
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: () => ({
					color: colors.charcoal,
					'&:hover': { backgroundColor: colors.tint },
					'&.Mui-focusVisible': focusRing,
				}),
			},
		},
		MuiLink: {
			styleOverrides: { root: { color: colors.charcoal } },
		},
		MuiPopover: {
			defaultProps: { elevation: 0 },
			styleOverrides: { paper: menuSurface },
		},
		MuiMenu: {
			defaultProps: { elevation: 0 },
			styleOverrides: { paper: menuSurface },
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					borderRadius: radii.item,
					'&:hover': { backgroundColor: colors.tint },
					'&.Mui-focusVisible': {
						backgroundColor: colors.tint,
						outline: `2px solid ${colors.accent}`,
						outlineOffset: -2,
					},
				},
			},
		},
	},
};

// Retain the existing font metrics, breakpoints, spacing and base shape so
// numeric sx values in the approved landing keep their current dimensions.
const publicTheme = createTheme(applicationTheme, options);
export default publicTheme;
