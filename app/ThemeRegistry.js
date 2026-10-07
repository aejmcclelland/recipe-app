'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme/theme';
import publicTheme from '@/theme/publicTheme';
import homeTheme from '@/theme/homeTheme';
import profileTheme from '@/theme/profileTheme';
import { usesHomeTheme, usesPublicTheme, usesRecipeDetailTheme, usesProfileTheme, usesImportTheme, usesRecipeEditTheme, usesRecipeAddTheme } from '@/theme/publicRoutes';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ThemeRegistry({ children }) {
	const pathname = usePathname();
	const { data: session } = useSession();
	const hasSession = Boolean(session?.user);
	let selectedTheme = theme;
	if (usesHomeTheme(pathname, hasSession)) {
		selectedTheme = homeTheme;
	} else if (usesProfileTheme(pathname, hasSession) || usesImportTheme(pathname, hasSession) || usesRecipeEditTheme(pathname, hasSession) || usesRecipeAddTheme(pathname, hasSession)) {
		selectedTheme = profileTheme;
	} else if (usesPublicTheme(pathname, hasSession) || usesRecipeDetailTheme(pathname, hasSession)) {
		selectedTheme = publicTheme;
	}

	return (
		<AppRouterCacheProvider>
			<ThemeProvider theme={selectedTheme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</AppRouterCacheProvider>
	);
}
