import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

class RateLimitError extends Error {}
let failure = '';
let saved = 0;
let lookedUp = 0;
let mailSent = 0;
let query: Record<string, unknown>;
let mail: { text: string };
let account: {
	password: string;
	resetPasswordTokenHash: string | null;
	resetPasswordExpires: Date | null;
	save: () => Promise<void>;
} | null;

mock.module('../../config/database.ts', { defaultExport: async () => {
	if (failure === 'database') throw new Error('private database error');
} });
mock.module('../../models/User.ts', { defaultExport: {
	findOne: async (filter: Record<string, unknown>) => {
		lookedUp++;
		if (failure === 'lookup') throw new Error('private lookup error');
		query = filter;
		if (!account) return null;
		if ('resetPasswordTokenHash' in filter && (
			filter.resetPasswordTokenHash !== account.resetPasswordTokenHash ||
			!account.resetPasswordExpires || account.resetPasswordExpires <= new Date()
		)) return null;
		return account;
	},
} });
mock.module('../../utils/rateLimit.ts', { namedExports: {
	RateLimitError,
	getRequestIp: async () => 'test-ip',
	enforceRateLimit: async (name: string, ip: string) => {
		assert.equal(name, 'password-reset');
		assert.equal(ip, 'test-ip');
		if (failure === 'rate') throw new RateLimitError('private rate error');
		if (failure === 'rate-service') throw new Error('private service error');
	},
} });
mock.module('../../utils/mailer.ts', { namedExports: {
	sendMail: async (args: { text: string }) => {
		mailSent++;
		mail = args;
		if (failure === 'mail') throw new Error('private mail provider error');
	},
} });
const { resetPassword } = await import('../../app/actions/resetPassword');
const { requestPasswordReset } = await import('../../app/actions/requestPasswordReset');
const params = { email: ' Cook@Example.com ', token: 'test-token', password: 'new-password' };

beforeEach(() => {
	failure = '';
	saved = 0;
	lookedUp = 0;
	mailSent = 0;
	account = {
		password: 'old-password',
		resetPasswordTokenHash: crypto.createHash('sha256').update(params.token).digest('hex'),
		resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000),
		save: async () => {
			if (failure === 'save') throw new Error('private save error');
			saved++;
		},
	};
});

for (const scenario of ['invalid', 'expired', 'used', 'unknown-account']) {
	test(`${scenario} reset link has the same safe result and does not save`, async () => {
		if (scenario === 'invalid') account!.resetPasswordTokenHash = 'different-hash';
		if (scenario === 'expired') account!.resetPasswordExpires = new Date(Date.now() - 1);
		if (scenario === 'used') account!.resetPasswordTokenHash = null;
		if (scenario === 'unknown-account') account = null;
		assert.deepEqual(await resetPassword(params), { ok: false, error: 'INVALID_LINK' });
		assert.equal(saved, 0);
		assert.equal(query.email, 'cook@example.com');
		assert.deepEqual(Object.keys(query).sort(), ['email', 'resetPasswordExpires', 'resetPasswordTokenHash']);
		assert.ok((query.resetPasswordExpires as { $gt: Date }).$gt instanceof Date);
	});
}

test('successful reset clears the token and expiry, and reuse fails', async () => {
	assert.deepEqual(await resetPassword(params), { ok: true });
	assert.equal(account!.password, params.password);
	assert.equal(account!.resetPasswordTokenHash, null);
	assert.equal(account!.resetPasswordExpires, null);
	assert.equal(saved, 1);
	assert.deepEqual(await resetPassword(params), { ok: false, error: 'INVALID_LINK' });
	assert.equal(saved, 1);
});

test('server still rejects short passwords and missing link parameters', async () => {
	assert.deepEqual(await resetPassword({ ...params, password: 'short' }), { ok: false, error: 'INVALID_PASSWORD' });
	assert.deepEqual(await resetPassword({ ...params, token: '' }), { ok: false, error: 'INVALID_LINK' });
	assert.deepEqual(await resetPassword({ ...params, email: '' }), { ok: false, error: 'INVALID_LINK' });
	assert.equal(lookedUp, 0);
	assert.equal(saved, 0);
});

for (const scenario of ['database', 'save', 'rate', 'rate-service']) {
	test(`reset ${scenario} failure returns only a safe error code`, async () => {
		failure = scenario;
		assert.deepEqual(await resetPassword(params), { ok: false, error: scenario === 'rate' ? 'RATE_LIMITED' : 'UNAVAILABLE' });
		assert.equal(saved, 0);
	});
}

test('accepted requests are neutral for known and unknown emails', async () => {
	const before = Date.now();
	assert.deepEqual(await requestPasswordReset(params.email), { ok: true });
	assert.equal(saved, 1);
	assert.equal(mailSent, 1);
	const token = new URL(mail.text.split('link: ')[1]).searchParams.get('token')!;
	assert.match(token, /^[a-f\d]{64}$/);
	assert.equal(account!.resetPasswordTokenHash, crypto.createHash('sha256').update(token).digest('hex'));
	assert.ok(account!.resetPasswordExpires!.getTime() >= before + 30 * 60 * 1000);
	assert.ok(account!.resetPasswordExpires!.getTime() <= Date.now() + 30 * 60 * 1000);
	account = null;
	assert.deepEqual(await requestPasswordReset(params.email), { ok: true });
	assert.equal(saved, 1);
	assert.equal(mailSent, 1);
});

for (const scenario of ['database', 'lookup', 'rate', 'rate-service']) {
	test(`request-wide ${scenario} failure is independent of account existence`, async () => {
		failure = scenario;
		const expected = { ok: false, error: scenario === 'rate' ? 'RATE_LIMITED' : 'UNAVAILABLE' };
		assert.deepEqual(await requestPasswordReset(params.email), expected);
		account = null;
		assert.deepEqual(await requestPasswordReset(params.email), expected);
		assert.equal(saved, 0);
		assert.equal(mailSent, 0);
	});
}

for (const scenario of ['mail', 'save']) {
	test(`account-dependent ${scenario} failure remains indistinguishable from unknown account`, async () => {
		failure = scenario;
		const log = mock.method(console, 'error', () => {});
		try {
			assert.deepEqual(await requestPasswordReset(params.email), { ok: true });
			assert.equal(log.mock.callCount(), 1);
			account = null;
			assert.deepEqual(await requestPasswordReset(params.email), { ok: true });
		} finally {
			log.mock.restore();
		}
	});
}

test('a newly issued reset link succeeds once through the existing token flow', async () => {
	await requestPasswordReset(params.email);
	const link = new URL(mail.text.split('link: ')[1]);
	const reset = { email: link.searchParams.get('email')!, token: link.searchParams.get('token')!, password: params.password };
	assert.deepEqual(await resetPassword(reset), { ok: true });
	assert.equal(account!.password, params.password);
	assert.deepEqual(await resetPassword(reset), { ok: false, error: 'INVALID_LINK' });
});
