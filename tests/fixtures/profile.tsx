// The real profile page and shell, with data/actions isolated from stored users.
import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import AuthProvider from '../../components/AuthProvider';
import ThemeRegistry from '../../app/ThemeRegistry';
import Appbar from '../../components/Appbar';
import Footer from '../../components/Footer';
import ProfilePage from '../../app/recipes/profile/page';

const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const scenario = () => new URLSearchParams(location.search).get('scenario');
const userDoc = {
	firstName: 'Rebekah', lastName: 'Tester', email: 'rebekah@example.test',
	emailVerified: true, image: null,
};
const recipes = ['Weeknight pesto pasta', 'Our family favourite'].map((name, index) => ({
	_id: `${index + 1}`.repeat(24), user: ownerId, name,
	image: '/images/landing/hero-pasta.jpg', category: { _id: '1', name: 'Pasta' },
}));
export const session = () => ({
	user: { id: ownerId, name: 'Rebekah Tester', email: userDoc.email, image: null },
	expires: '2099-01-01T00:00:00.000Z',
});
export const getSessionUser = async () => scenario() === 'signed-out' ? null : session().user;
export async function connectDB() {
	if (scenario() === 'error') throw new Error('Fixture database failure');
}
export const userModel = {
	findById: (id: string) => ({
		select: () => ({ lean: async () => scenario() === 'missing' ? null : userDoc }),
		populate: (options: { match: unknown }) => {
			document.documentElement.dataset.bookmarkFilter = JSON.stringify(options.match);
			return { lean: async () => ({ _id: id, bookmarks: scenario() === 'empty' ? [] : recipes }) };
		},
	}),
};
export const recipeModel = {
	find: (filter: unknown) => {
		document.documentElement.dataset.ownedFilter = JSON.stringify(filter);
		return { populate: () => ({ lean: async () => scenario() === 'empty' ? [] : recipes }) };
	},
};

const subscribe = (callback: () => void) => {
	window.addEventListener('popstate', callback);
	return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname, () => '/recipes/profile');
function push(url: string) {
	history.pushState(null, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
export const useRouter = () => ({ push, refresh() {
	document.documentElement.dataset.refreshCalls = String(Number(document.documentElement.dataset.refreshCalls ?? 0) + 1);
} });
export function FixtureLink({ href, children, passHref: _passHref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { passHref?: boolean }) {
	return <a {...props} href={href} onClick={event => { event.preventDefault(); push(href ?? '/'); }}>{children}</a>;
}
export async function signOut({ callbackUrl }: { callbackUrl: string }) {
	document.documentElement.dataset.signOut = callbackUrl;
	push(callbackUrl);
}
function call(name: string) {
	document.documentElement.dataset[`${name}Calls`] = String(Number(document.documentElement.dataset[`${name}Calls`] ?? 0) + 1);
}
async function finish(name: string) {
	await new Promise<void>(resolve => window.addEventListener(`fixture-${name}-complete`, () => resolve(), { once: true }));
}
export async function updateProfileDetails(input: { firstName: string; lastName: string; email: string }) {
	call('save');
	document.documentElement.dataset.saveInput = JSON.stringify(input);
	await finish('save');
	if (document.documentElement.dataset.saveResult === 'failure') throw new Error('Fixture validation failure');
	return {
		user: { ...input, emailVerified: input.email === userDoc.email },
		requiresEmailVerification: input.email !== userDoc.email,
	};
}
export async function updateProfileImage(file: File) {
	call('upload');
	document.documentElement.dataset.uploadName = file.name;
	await finish('upload');
	if (document.documentElement.dataset.uploadResult === 'failure') throw new Error('Fixture upload failure');
	return '/images/branding/logo-face.png?profile-upload=1';
}
export async function deleteAccount() {
	call('delete');
	await finish('delete');
	if (document.documentElement.dataset.deleteResult === 'throw') throw new Error('Fixture delete failure');
	return { success: document.documentElement.dataset.deleteResult !== 'failure' };
}
const saved = new Set(recipes.map(recipe => recipe._id));
export async function bookmark(id: string) {
	call('bookmark');
	await finish('bookmark');
	if (document.documentElement.dataset.bookmarkResult === 'failure') return { success: false };
	if (saved.has(id)) saved.delete(id);
	else saved.add(id);
	return { success: true, isBookmarked: saved.has(id) };
}

function FixtureApp({ content }: { content: React.ReactNode }) {
	const pathname = usePathname();
	return <AuthProvider session={scenario() === 'signed-out' ? null : session()}>
		<ThemeRegistry>
			<ToastContainer autoClose={false} />
			<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
				<Appbar />
				<Container component='main' sx={{ flex: 1, py: 3 }}>
					{pathname === '/recipes/profile' ? content : <div>Navigation destination</div>}
				</Container>
				<Footer />
			</Box>
		</ThemeRegistry>
	</AuthProvider>;
}
async function render() {
	const content = await ProfilePage();
	createRoot(document.getElementById('root')!).render(<FixtureApp content={content} />);
}
void render();
