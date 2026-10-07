// Real Add route and shell with isolated categories/action; no stored recipes change.
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '../../components/AuthProvider';
import ThemeRegistry from '../../app/ThemeRegistry';
import Appbar from '../../components/Appbar';
import Footer from '../../components/Footer';
import AddPage from '../../app/recipes/add/page';

const user = { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Rebekah Tester', email: 'rebekah@example.test', image: null };
export async function getCategories() {
	return new URLSearchParams(location.search).has('empty-categories') ? [] : [
		{ _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Pasta' },
		{ _id: 'dddddddddddddddddddddddd', name: 'Dinner' },
	];
}
export async function addRecipe(data: FormData) {
	document.documentElement.dataset.addData = JSON.stringify(Object.fromEntries([...data.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : { name: value.name, size: value.size, type: value.type }])));
	await new Promise<void>(resolve => window.addEventListener('fixture-add-complete', () => resolve(), { once: true }));
	push('/recipes/cccccccccccccccccccccccc');
}
const subscribe = (callback: () => void) => {
	window.addEventListener('popstate', callback);
	return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => '/recipes/add');
function push(url: string) { history.pushState(null, '', url); window.dispatchEvent(new PopStateEvent('popstate')); }
export const useRouter = () => ({ push });
export function FixtureLink({ href, children, passHref: _passHref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { passHref?: boolean }) {
	return <a {...props} href={href} onClick={event => { event.preventDefault(); push(href ?? '/'); }}>{children}</a>;
}
function FixtureApp({ content }: { content: React.ReactNode }) {
	const pathname = usePathname();
	return <AuthProvider session={{ user, expires: '2099-01-01T00:00:00.000Z' }}>
		<ThemeRegistry>
			<ToastContainer autoClose={false} />
			<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
				<Appbar />
				<Container component='main' sx={{ flex: 1, py: 3 }}>{pathname === '/recipes/add' ? content : <div>Navigation destination</div>}</Container>
				<Footer />
			</Box>
		</ThemeRegistry>
	</AuthProvider>;
}
async function render() {
	const content = await AddPage();
	createRoot(document.getElementById('root')!).render(<FixtureApp content={content} />);
}
void render();
