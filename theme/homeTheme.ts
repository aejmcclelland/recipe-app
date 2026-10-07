import { createTheme } from '@mui/material/styles';
import publicTheme from './publicTheme';

// Selected only for authenticated `/`. The public theme and legacy recipe
// routes keep their existing input styles.
const homeTheme = createTheme(publicTheme, {
	components: {
		MuiInputBase: {
			styleOverrides: {
				root: ({ theme }) => ({
					color: theme.palette.text.primary,
					backgroundColor: 'transparent',
					borderRadius: 0,
					padding: 0,
					'& .MuiInputBase-input': {
						padding: '12px 0',
						width: '100%',
					},
				}),
			},
		},
	},
});

export default homeTheme;
