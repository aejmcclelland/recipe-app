import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import type { Session, User as AuthUser } from 'next-auth';

const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const otherId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const accounts = [ownerId, otherId].map((id, index) => ({
	_id: { toString: () => id, toHexString: () => id },
	email: `${index}@example.com`, firstName: 'Recipe', lastName: 'Owner',
	image: null, authProvider: 'google', emailVerified: new Date(),
	comparePassword: async () => true,
}));
let session: Session | null;
let lookedUp: string[];
mock.module('next-auth', { namedExports: { getServerSession: async () => session } });
// Provider factories are CJS under Node; Next.js normally supplies the interop.
for (const id of ['google', 'credentials']) {
	mock.module(`next-auth/providers/${id}`, { defaultExport: (options: unknown) => ({ id, options }) });
}
mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../models/User.ts', { defaultExport: {
	findById: (id: string) => {
		lookedUp.push(id);
		return { select: () => ({ lean: async () => accounts.find(a => a._id.toString() === id) ?? null }) };
	},
	findOne: async ({ email }: { email: string }) => accounts.find(a => a.email === email) ?? null,
} });
const { authOptions } = await import('../../utils/authOptions');
const { getSessionUser } = await import('../../utils/getSessionUser');

beforeEach(() => {
	session = { user: { id: ownerId, email: accounts[0].email }, expires: '2099-01-01' };
	lookedUp = [];
});

test('session email cannot select another registered account', async () => {
	session!.user.email = accounts[1].email;
	assert.equal((await getSessionUser())?.id, ownerId);
	assert.equal((await getSessionUser())?.email, accounts[0].email);
	assert.deepEqual(lookedUp, [ownerId, ownerId]);
});

test('a stable ID works without a session email', async () => {
	delete session!.user.email;
	assert.equal((await getSessionUser())?.id, ownerId);
});

for (const id of ['', 'invalid', 'cccccccccccccccccccccccc']) {
	test(`invalid or deleted identity fails closed: ${id}`, async () => {
		session!.user.id = id;
		assert.equal(await getSessionUser(), null);
	});
}
test('signed-out identity fails closed', async () => {
	session = null;
	assert.equal(await getSessionUser(), null);
	assert.deepEqual(lookedUp, []);
});

test('client JWT updates preserve ID through session callback and database lookup', async () => {
	const jwt = authOptions.callbacks!.jwt!;
	const token = await jwt({
		token: { user: { id: ownerId, email: accounts[0].email } },
		trigger: 'update', session: { user: { id: otherId, email: accounts[1].email } },
	} as Parameters<typeof jwt>[0]);
	assert.equal(token.user?.id, ownerId);
	const callback = authOptions.callbacks!.session!;
	session = await callback({ session, token } as Parameters<typeof callback>[0]) as Session;
	assert.equal((await getSessionUser())?.id, ownerId);
});

test('Credentials returns the database ID and JWT persists it', async () => {
	const provider = authOptions.providers.find(p => p.id === 'credentials');
	// NextAuth provider factories keep application options on options.
	const credentials = provider as unknown as { options: {
		authorize: (input: { email: string; password: string }) => Promise<AuthUser>;
	} };
	const user = await credentials.options.authorize({ email: accounts[0].email, password: 'valid' });
	assert.equal(user.id, ownerId);
	const jwt = authOptions.callbacks!.jwt!;
	const token = await jwt({ token: {}, user } as Parameters<typeof jwt>[0]);
	assert.equal(token.user?.id, ownerId);
});

test('Google sign-in replaces provider ID with database ID before JWT creation', async () => {
	const user = { id: 'google-provider-id', email: accounts[0].email };
	const signIn = authOptions.callbacks!.signIn!;
	assert.equal(await signIn({
		user, account: { provider: 'google' }, profile: { email: accounts[0].email },
	} as Parameters<typeof signIn>[0]), true);
	assert.equal(user.id, ownerId);
	const jwt = authOptions.callbacks!.jwt!;
	const token = await jwt({ token: {}, user } as Parameters<typeof jwt>[0]);
	assert.equal(token.user?.id, ownerId);
});
