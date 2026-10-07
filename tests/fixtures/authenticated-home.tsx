// Browser fixture for the real home page and shared shell. Only server data,
// navigation and bookmark persistence are doubled; no stored data is changed.
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '../../components/AuthProvider';
import ThemeRegistry from '../../app/ThemeRegistry';
import { FilterProvider } from '../../context/FilterContext';
import Appbar from '../../components/Appbar';
import Footer from '../../components/Footer';
import Home from '../../app/page';
import RecipeOverviewCard from '../../components/RecipeOverviewCard';
import FloatingIconButton from '../../components/FloatingIconButton';

const user = {
	id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Rebekah Tester',
	email: 'home@example.test', image: null,
	bookmarks: ['222222222222222222222222'],
};
const categories = ['Pasta', 'Soup', 'Chicken', 'Vegetable', 'Desserts', 'Other']
	.map((name, index) => ({ _id: String(index), name }));
const recipes = [
	{ _id: '111111111111111111111111', name: 'Weeknight pesto pasta', category: categories[0] },
	{ _id: '222222222222222222222222', name: 'Our family favourite', category: categories[0] },
].map(recipe => ({ ...recipe, user: user.id, image: '/images/landing/hero-pasta.jpg' }));
const shared = [{
	_id: '333333333333333333333333', name: 'Pasta for sharing',
	category: categories[0], user: 'bbbbbbbbbbbbbbbbbbbbbbbb',
	image: '/images/landing/hero-pasta.jpg',
}];

export function data() {
	const scenario = new URLSearchParams(location.search).get('scenario');
	return {
		user, categories,
		recipes: scenario === 'empty' || scenario === 'shared-only' ? [] : recipes,
		shared: scenario === 'empty' || scenario === 'owned-only' ? [] : shared,
	};
}

const subscribe = (callback: () => void) => {
	window.addEventListener('popstate', callback);
	return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => '/');
function push(url: string) {
	history.pushState(null, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
export const useRouter = () => ({ push, refresh() {} });
export function FixtureLink({ href, children, passHref: _passHref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { passHref?: boolean }) {
	return <a {...props} href={href} onClick={event => {
		event.preventDefault();
		push(href ?? '/');
	}}>{children}</a>;
}

const saved = new Set(user.bookmarks);
export async function bookmark(recipeId: string) {
	document.documentElement.dataset.bookmarkCalls = String(Number(document.documentElement.dataset.bookmarkCalls ?? 0) + 1);
	await new Promise<void>(resolve => window.addEventListener('fixture-bookmark-complete', () => resolve(), { once: true }));
	if (document.documentElement.dataset.bookmarkResult === 'failure') return { success: false };
	if (document.documentElement.dataset.bookmarkResult === 'throw') throw new Error('Fixture request failed');
	const isBookmarked = !saved.has(recipeId);
	if (isBookmarked) saved.add(recipeId);
	else saved.delete(recipeId);
	return { success: true, isBookmarked };
}

function FixtureApp({ content }: { content: React.ReactNode }) {
	const pathname = usePathname();
	return <AuthProvider session={{ user, expires: '2099-01-01T00:00:00.000Z' }}>
		<ThemeRegistry>
			<ToastContainer autoClose={false} />
			<FilterProvider>
				<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
					<Appbar />
					<Container sx={{ flex: 1, py: 3 }}>
						{pathname === '/' ? content : <Box data-testid='deferred-route-fixture'>
							<RecipeOverviewCard recipe={recipes[0]} user={user} isBookmarked={false} />
							<FloatingIconButton tooltip='Legacy action' icon={<span>Action</span>} onClick={() => {}} />
						</Box>}
					</Container>
					<Footer />
				</Box>
			</FilterProvider>
		</ThemeRegistry>
	</AuthProvider>;
}

async function render() {
	const content = await Home();
	createRoot(document.getElementById('root')!).render(<FixtureApp content={content} />);
}
void render();
