// Guest landing shell for screenshots; the real landing component supplies the content.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import AuthProvider from '../components/AuthProvider';
import ThemeRegistry from '../app/ThemeRegistry';
import { FilterProvider } from '../context/FilterContext';
import Appbar from '../components/Appbar';
import Footer from '../components/Footer';
import WelcomeSection from '../components/WelcomeSection';

export const usePathname = () => '/';
export const useRouter = () => ({ push() {}, refresh() {} });
export function FixtureLink({ href, children, passHref: _passHref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { passHref?: boolean }) {
	return <a {...props} href={href}>{children}</a>;
}

createRoot(document.getElementById('root')!).render(
	<AuthProvider session={null}>
		<ThemeRegistry>
			<FilterProvider>
				<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
					<Appbar />
					<Container sx={{ flex: 1, py: 3 }}><WelcomeSection /></Container>
					<Footer />
				</Box>
			</FilterProvider>
		</ThemeRegistry>
	</AuthProvider>,
);
