// Real detail page, theme and shell with isolated data/action/navigation doubles.
// This fixture never reads credentials or changes stored recipes.
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '../../components/AuthProvider';
import ThemeRegistry from '../../app/ThemeRegistry';
import Appbar from '../../components/Appbar';
import Footer from '../../components/Footer';
import RecipeDetailPage from '../../app/recipes/[id]/page';

export const recipeId = 'cccccccccccccccccccccccc';
const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const recipientId = 'eeeeeeeeeeeeeeeeeeeeeeee';
const ingredients = [
	{ _id: '1', quantity: 200, unit: 'g', ingredient: { name: 'pasta' } },
	{ _id: '2', quantity: 1.5, unit: 'tablespoon', ingredient: { name: 'olive oil' } },
	{ _id: '3', quantity: 0.25, unit: 'teaspoon', ingredient: { name: 'sea salt' } },
	{ _id: '4', quantity: 1, unit: 'unit', ingredient: { name: 'A handful of fresh basil' } },
	{ _id: '5', quantity: 2, ingredient: { name: 'garlic cloves, finely chopped' } },
	{ _id: '6', quantity: 0.5, unit: 'other', customUnit: 'cup', ingredient: { name: 'grated parmesan' } },
];

export function data() {
	const scenario = new URLSearchParams(location.search).get('scenario');
	return {
		user: { id: scenario === 'shared' ? recipientId : ownerId, name: 'Rebekah Tester', email: 'owner@example.com', image: null },
		recipe: {
			_id: recipeId, user: ownerId,
			name: 'Weeknight pesto pasta', image: '/images/landing/hero-pasta.jpg',
			prepTime: 10, cookTime: 15, serves: 2,
			ingredients: scenario === 'empty' ? [] : ingredients,
			steps: scenario === 'empty' ? [] : [
				'Bring a large pan of salted water to the boil. Add the pasta and cook until al dente, following the packet instructions.',
				'Warm the olive oil in a wide pan. Add the garlic and cook gently until fragrant, taking care not to let it colour.',
				'Reserve a cup of the pasta cooking water, then drain. Toss the pasta with the pesto, adding a little cooking water to loosen the sauce.',
			],
			method: scenario === 'empty' ? '' : '  Fold in the basil and parmesan.\nServe immediately with extra parmesan at the table.  ',
		},
	};
}

const subscribe = (callback: () => void) => {
	window.addEventListener('popstate', callback);
	return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => `/recipes/${recipeId}`);
function push(url: string) {
	history.pushState(null, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
export const useRouter = () => ({ push, refresh() {} });
export function FixtureLink({ href, children, passHref: _passHref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { passHref?: boolean }) {
	return <a {...props} href={href} onClick={event => { event.preventDefault(); push(href ?? '/'); }}>{children}</a>;
}

let saved = false;
export async function bookmark() {
	document.documentElement.dataset.bookmarkCalls = String(Number(document.documentElement.dataset.bookmarkCalls ?? 0) + 1);
	await new Promise<void>(resolve => window.addEventListener('fixture-bookmark-complete', () => resolve(), { once: true }));
	if (document.documentElement.dataset.bookmarkResult === 'failure') return { success: false };
	if (document.documentElement.dataset.bookmarkResult === 'throw') throw new Error('Fixture request failed');
	saved = !saved;
	return { success: true, isBookmarked: saved };
}
export async function deleteRecipe() {
	document.documentElement.dataset.deleteCalls = String(Number(document.documentElement.dataset.deleteCalls ?? 0) + 1);
}

function FixtureApp({ content }: { content: React.ReactNode }) {
	const pathname = usePathname();
	return <AuthProvider session={{ user: data().user, expires: '2099-01-01T00:00:00.000Z' }}>
		<ThemeRegistry>
			<ToastContainer autoClose={false} />
			<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
				<Appbar />
				<Container component='main' sx={{ flex: 1, py: 3 }}>
					{pathname === `/recipes/${recipeId}` ? content : <div>Navigation destination</div>}
				</Container>
				<Footer />
			</Box>
		</ThemeRegistry>
	</AuthProvider>;
}
async function render() {
	const content = await RecipeDetailPage({ params: Promise.resolve({ id: recipeId }) });
	createRoot(document.getElementById('root')!).render(<FixtureApp content={content} />);
}
void render();
