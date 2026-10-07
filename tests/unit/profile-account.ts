import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';

const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
type StoredUser = {
	_id: string; firstName: string; lastName: string; email: string;
	emailVerified: Date | null; save(): Promise<StoredUser>;
};
let viewer: { id: string } | null;
let user: StoredUser | null;
let duplicate: boolean;
let saves: number;
let uploadFailure: boolean;
let sent: string[];
let writes: unknown[];

mock.module('../../config/database.ts', { defaultExport: async () => {} });
mock.module('../../utils/getSessionUser.ts', { namedExports: { getSessionUser: async () => viewer } });
mock.module('../../app/actions/resendVerificationEmail.ts', { namedExports: {
	resendVerificationEmail: async (email: string) => { sent.push(email); },
} });
mock.module('../../models/User.ts', { defaultExport: {
	findById: async (userId: string) => { assert.equal(userId, id); return user; },
	findOne: () => ({ select: () => ({ lean: async () => duplicate ? { _id: 'other' } : null }) }),
	findByIdAndUpdate: async (...args: unknown[]) => { writes.push(args); return user; },
	deleteMany: async (filter: unknown) => { writes.push({ bookmarks: filter }); },
	findByIdAndDelete: async (userId: string) => { writes.push({ deleteUser: userId }); return user; },
} });
mock.module('../../models/Recipe.ts', { defaultExport: {
	deleteMany: async (filter: unknown) => { writes.push({ recipes: filter }); },
} });
mock.module('../../config/cloudinary.js', { defaultExport: { uploader: {
	upload_stream: (options: unknown, callback: (error: Error | null, result?: { secure_url: string }) => void) => ({
		end: (buffer: Buffer) => {
			assert.equal(buffer.toString(), 'image-bytes');
			assert.deepEqual(options, { folder: 'profile_pictures', public_id: id, overwrite: true, resource_type: 'image' });
			callback(uploadFailure ? new Error('Upload failed') : null, { secure_url: 'https://example.test/avatar.png' });
		},
	}),
} } });

const { default: updateDetails } = await import('../../app/actions/updateProfileDetails');
const { default: updateImage } = await import('../../app/actions/updateProfileImage.js');
const { deleteAccount } = await import('../../app/actions/deleteAccount');

beforeEach(() => {
	viewer = { id };
	duplicate = false; saves = 0; uploadFailure = false; sent = []; writes = [];
	user = {
		_id: id, firstName: 'Rebekah', lastName: 'Tester', email: 'rebekah@example.test', emailVerified: new Date(),
		async save() { saves++; return user!; },
	};
});

test('profile updates preserve normalization, names and verified email', async () => {
	const result = await updateDetails({ firstName: ' Updated ', lastName: '', email: ' Rebekah@Example.Test ' });
	assert.equal(result.user.firstName, 'Updated');
	assert.equal(result.user.lastName, 'Tester');
	assert.equal(result.user.email, 'rebekah@example.test');
	assert.equal(result.user.emailVerified, true);
	assert.equal(result.requiresEmailVerification, false);
	assert.equal(saves, 1);
	assert.deepEqual(sent, []);
});

test('changed email requires re-verification and uses the session account', async () => {
	const result = await updateDetails({ email: ' New@Example.Test ' });
	assert.equal(result.user.id, id);
	assert.equal(result.user.email, 'new@example.test');
	assert.equal(result.user.emailVerified, false);
	assert.equal(result.requiresEmailVerification, true);
	assert.deepEqual(sent, ['new@example.test']);
});

test('invalid email, missing names and duplicate email retain validation without saves', async () => {
	await assert.rejects(() => updateDetails({ email: 'invalid' }), /valid email/);
	duplicate = true;
	await assert.rejects(() => updateDetails({ email: 'other@example.test' }), /already in use/);
	duplicate = false; user!.firstName = '';
	await assert.rejects(() => updateDetails({ email: 'rebekah@example.test' }), /first and last name/);
	assert.equal(saves, 0);
});

test('signed-out profile mutations remain denied', async () => {
	viewer = null;
	await assert.rejects(() => updateDetails({ email: 'rebekah@example.test' }), /logged in/);
	await assert.rejects(() => updateImage(new File(['image-bytes'], 'avatar.png', { type: 'image/png' })), /logged in/);
	await assert.rejects(() => deleteAccount(), /logged in/);
	assert.equal(saves, 0);
	assert.deepEqual(writes, []);
});

test('avatar upload validates files and stores the URL against the session ID', async () => {
	await assert.rejects(() => updateImage(null), /valid image file/);
	await assert.rejects(() => updateImage(new File(['text'], 'file.txt', { type: 'text/plain' })), /upload an image/);
	await assert.rejects(() => updateImage(new File([], 'empty.png', { type: 'image/png' })), /valid image file/);
	assert.deepEqual(writes, []);
	assert.equal(await updateImage(new File(['image-bytes'], 'avatar.png', { type: 'image/png' })), 'https://example.test/avatar.png');
	assert.deepEqual(writes, [[id, { image: 'https://example.test/avatar.png' }, { new: true }]]);
});

test('failed avatar upload does not persist a new URL', async () => {
	uploadFailure = true;
	await assert.rejects(() => updateImage(new File(['image-bytes'], 'avatar.png', { type: 'image/png' })), /Image upload failed/);
	assert.deepEqual(writes, []);
});

test('account deletion preserves the existing session-scoped cascade', async () => {
	assert.deepEqual(await deleteAccount(), { success: true });
	assert.deepEqual(writes, [{ recipes: { user: id } }, { bookmarks: { user: id } }, { deleteUser: id }]);
});

test('missing profile remains an error for updates and deletion', async () => {
	user = null;
	await assert.rejects(() => updateDetails({ email: 'rebekah@example.test' }), /User not found/);
	await assert.rejects(() => deleteAccount(), /User not found/);
});
