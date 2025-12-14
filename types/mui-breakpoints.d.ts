// types/mui-breakpoints.d.ts

import '@mui/system';

declare module '@mui/material/styles' {
	interface BreakpointOverrides {
		// keep default MUI breakpoints enabled
		xs: true;
		sm: true;
		md: true;
		lg: true;
		xl: true;

		// custom breakpoints used in this project
		mobile: true;
		tablet: true;
		laptop: true;
		desktop: true;
	}
}
