// Real edit page and shell with isolated data/actions; no stored recipes change.
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '../../components/AuthProvider';
import ThemeRegistry from '../../app/ThemeRegistry';
import Appbar from '../../components/Appbar';
import Footer from '../../components/Footer';
import EditPage from '../../app/recipes/[id]/edit/page';

const id = 'cccccccccccccccccccccccc';
const user = { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Rebekah Tester', email: 'rebekah@example.test', image: null };
const scenario = () => new URLSearchParams(location.search).get('scenario');
const recipe = () => ({
	_id: id, user: user.id, name: 'Weeknight pesto pasta', category: 'pasta',
	image: '/images/landing/hero-pasta.jpg', prepTime: 10, cookTime: 15, serves: 2,
	ingredients: [
		{ _id: '1', ingredient: { name: 'pasta' }, quantity: 200, unit: 'g' },
		{ _id: '2', ingredient: { name: 'olive oil' }, quantity: 1.5, unit: 'tablespoon' },
		{ _id: '3', ingredient: { name: 'fresh basil' }, quantity: '', unit: scenario() === 'custom-unit' ? 'handful' : '' },
	],
	steps: ['Cook the pasta in a large pan of salted water.', 'Warm the olive oil, stir in the pesto and toss with the pasta.', 'Finish with fresh basil and serve.'],
});
export const connectDB = async () => {};
export const getSessionUser = async () => user;
export const recipeModel = { findOne: () => ({ populate: () => ({ lean: async () => recipe() }) }) };
export const categoryModel = { find: () => ({ lean: async () => [{ _id: 'pasta', name: 'Pasta' }, { _id: 'dinner', name: 'Dinner' }] }) };
export async function updateRecipe(recipeId: string, data: FormData) {
	document.documentElement.dataset.updateId = recipeId;
	document.documentElement.dataset.updateData = JSON.stringify(Object.fromEntries([...data.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : { name: value.name, size: value.size, type: value.type }])));
	await new Promise<void>(resolve => window.addEventListener('fixture-update-complete', () => resolve(), { once: true }));
	if (document.documentElement.dataset.updateFailure) throw new Error('Fixture update failure');
	return recipeId;
}
export async function deleteRecipe(recipeId: string) {
	document.documentElement.dataset.deleteId = recipeId;
	await new Promise<void>(resolve => window.addEventListener('fixture-delete-complete', () => resolve(), { once: true }));
	if (document.documentElement.dataset.deleteFailure) throw new Error('Fixture delete failure');
}
const subscribe = (callback: () => void) => {
	window.addEventListener('popstate', callback);
	return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => `/recipes/${id}/edit`);
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
				<Container component='main' sx={{ flex: 1, py: 3 }}>{pathname === `/recipes/${id}/edit` ? content : <div>Navigation destination</div>}</Container>
				<Footer />
			</Box>
		</ThemeRegistry>
	</AuthProvider>;
}
async function render() {
	const content = await EditPage({ params: Promise.resolve({ id }) });
	createRoot(document.getElementById('root')!).render(<FixtureApp content={content} />);
}
void render();
