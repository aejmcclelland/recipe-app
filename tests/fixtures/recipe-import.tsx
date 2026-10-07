// Actual import page/components and shell; data and mutation boundaries are doubles.
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '../../components/AuthProvider';
import ThemeRegistry from '../../app/ThemeRegistry';
import Appbar from '../../components/Appbar';
import Footer from '../../components/Footer';
import ImportPage from '../../app/recipes/copyWeb/page';
import type { RecipeResult } from '../../types/recipe';

const recipe: RecipeResult = {
	title: 'Weeknight tomato pasta',
	sourceUrl: 'https://www.bbcgoodfood.com/recipes/pasta',
	image: '/images/landing/hero-pasta.jpg',
	ingredients: ['300g pasta', '2 tbsp olive oil', '2 garlic cloves, finely sliced', '400g chopped tomatoes', 'A handful of fresh basil', 'Parmesan, to serve'],
	steps: ['Bring a large pan of salted water to the boil. Cook the pasta until al dente, reserving a cup of the cooking water.', 'Warm the olive oil in a wide pan. Add the garlic and cook gently, then stir in the tomatoes and simmer for 15 minutes.', 'Toss the pasta with the sauce, adding a splash of cooking water as needed. Finish with basil and Parmesan.'],
};
export const getCategories = async () => [{ _id: 'pasta', name: 'Pasta' }, { _id: 'dinner', name: 'Dinner' }];
export async function scrapeData(formData: FormData) {
	document.documentElement.dataset.scrapeCalls = String(Number(document.documentElement.dataset.scrapeCalls ?? 0) + 1);
	return { ...recipe, sourceUrl: String(formData.get('url')) };
}
export async function saveScrapedRecipe(data: RecipeResult, category: string) {
	document.documentElement.dataset.saveCalls = String(Number(document.documentElement.dataset.saveCalls ?? 0) + 1);
	document.documentElement.dataset.savedCategory = category;
	await new Promise<void>(resolve => window.addEventListener('fixture-save-complete', () => resolve(), { once: true }));
	if (document.documentElement.dataset.saveFailure) throw new Error('Fixture save failure');
	return { ...data, _id: 'cccccccccccccccccccccccc' };
}
const subscribe = (callback: () => void) => {
	window.addEventListener('popstate', callback);
	return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => '/recipes/copyWeb');
function push(url: string) {
	history.pushState(null, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
export const useRouter = () => ({ push });
export function FixtureLink({ href, children, passHref: _passHref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { passHref?: boolean }) {
	return <a {...props} href={href} onClick={event => { event.preventDefault(); push(href ?? '/'); }}>{children}</a>;
}
function FixtureApp({ content }: { content: React.ReactNode }) {
	const pathname = usePathname();
	return <AuthProvider session={{ user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Rebekah Tester', email: 'rebekah@example.test', image: null }, expires: '2099-01-01T00:00:00.000Z' }}>
		<ThemeRegistry>
			<ToastContainer autoClose={false} />
			<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
				<Appbar />
				<Container component='main' sx={{ flex: 1, py: 3 }}>
					{pathname === '/recipes/copyWeb' ? content : <div>Navigation destination</div>}
				</Container>
				<Footer />
			</Box>
		</ThemeRegistry>
	</AuthProvider>;
}
async function render() {
	const params = new URLSearchParams(location.search);
	const urls = params.getAll('url');
	const url = urls.length > 1 ? urls : urls[0];
	const content = await ImportPage({ searchParams: Promise.resolve({ url }) });
	createRoot(document.getElementById('root')!).render(<FixtureApp content={content} />);
}
void render();
