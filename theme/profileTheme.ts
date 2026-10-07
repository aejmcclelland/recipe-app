import { createTheme } from '@mui/material/styles';
import publicTheme from './publicTheme';

// Profile fields retain MUI's outlined/adornment padding instead of inheriting
// the legacy search-input override. Public and home inputs remain unchanged.
const profileTheme = createTheme(publicTheme, {
	components: {
		MuiInputBase: {
			styleOverrides: {
				root: ({ theme }) => ({
					color: theme.palette.text.primary,
					backgroundColor: theme.palette.background.paper,
				}),
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: ({ theme }) => ({
					borderRadius: theme.shape.borderRadius * 2,
					'& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
					'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary },
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.primary },
				}),
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: ({ theme }) => ({ '&.Mui-focused': { color: theme.palette.text.primary } }),
			},
		},
	},
});

export default profileTheme;
