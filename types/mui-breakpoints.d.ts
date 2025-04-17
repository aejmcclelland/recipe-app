// types/mui-breakpoints.d.ts

import '@mui/system';

declare module '@mui/material/styles' {
	interface BreakpointOverrides {
		// only include the breakpoints you're using
		mobile: true;
		tablet: true;
		laptop: true;
		desktop: true;
		// disable default breakpoints
		xs: false;
		sm: false;
		md: false;
		lg: false;
		xl: false;
	}
}
