import crypto from 'node:crypto';
import type { Types } from 'mongoose';

import EmailVerificationToken from '@/models/EmailVerificationToken';
import User from '@/models/User';
import { sendMail } from '@/utils/mailer';

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

type VerificationEmailInput = {
	userId: Types.ObjectId | string;
	firstName?: string | null;
	email: string;
};

type VerifyEmailTokenInput = {
	email: string;
	token: string;
};

type VerifyEmailTokenResult = {
	status: 'verified' | 'already_verified' | 'invalid';
};

export function normalizeEmail(value: unknown): string {
	return (value ?? '').toString().trim().toLowerCase();
}

export function hashVerificationToken(token: string): string {
	return crypto.createHash('sha256').update(token).digest('hex');
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function buildVerificationEmail({
	firstName,
	email,
	verificationUrl,
}: {
	firstName: string;
	email: string;
	verificationUrl: string;
}) {
	const safeFirstName = escapeHtml(firstName);
	const safeEmail = escapeHtml(email);
	const safeVerificationUrl = escapeHtml(verificationUrl);

	return {
		subject: 'Verify your email for Rebekah’s Recipes',
		text: `Hi ${firstName},

Thanks for signing up to Rebekah's Recipes.

Please verify your email address to finish setting up your account:

${verificationUrl}

This link expires in 24 hours.

Account email: ${email}

If you didn't create an account, you can safely ignore this email.

The Rebekah's Recipes team`,
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #2d2a26; line-height: 1.6;">
				<div style="text-align: center; margin-bottom: 24px;">
					<div style="font-size: 28px; font-weight: 700; color: #b23a2b;">Rebekah&apos;s Recipes</div>
				</div>

				<p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>

				<p style="margin: 0 0 16px;">
					Thanks for signing up to <strong>Rebekah&apos;s Recipes</strong>.
				</p>

				<p style="margin: 0 0 24px;">
					Please verify your email address to finish setting up your account and start saving your favourite recipes.
				</p>

				<div style="text-align: center; margin: 32px 0;">
					<a
						href="${safeVerificationUrl}"
						style="display: inline-block; background: #b23a2b; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 999px; font-weight: 700;"
					>
						Verify your email
					</a>
				</div>

				<p style="margin: 0 0 12px;">
					If the button doesn&apos;t work, copy and paste this link into your browser:
				</p>
				<p style="margin: 0 0 24px; word-break: break-word;">
					<a href="${safeVerificationUrl}" style="color: #b23a2b;">${safeVerificationUrl}</a>
				</p>

				<p style="margin: 0 0 8px;"><strong>This link expires in 24 hours.</strong></p>
				<p style="margin: 0 0 24px;">Account email: ${safeEmail}</p>

				<p style="margin: 0 0 16px;">
					If you didn&apos;t create an account, you can safely ignore this email.
				</p>

				<p style="margin: 0;">
					Happy cooking,<br />
					The Rebekah&apos;s Recipes team
				</p>
			</div>
		`,
	};
}

function getRecipesAppUrl(): string {
	const rawSiteUrl =
		process.env.APP_URL ||
		(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');

	if (!rawSiteUrl) {
		throw new Error('APP_URL must be set.');
	}

	const siteUrl = rawSiteUrl.replace(/\/+$/, '');
	return siteUrl.endsWith('/recipes') ? siteUrl : `${siteUrl}/recipes`;
}

export function buildVerificationUrl(email: string, token: string): string {
	const normalizedEmail = normalizeEmail(email);
	const recipesAppUrl = getRecipesAppUrl();

	return `${recipesAppUrl}/verify?email=${encodeURIComponent(
		normalizedEmail,
	)}&token=${encodeURIComponent(token)}`;
}

export async function createEmailVerificationToken({
	userId,
	email,
}: Pick<VerificationEmailInput, 'userId' | 'email'>) {
	const normalizedEmail = normalizeEmail(email);
	const rawToken = crypto.randomBytes(32).toString('hex');
	const tokenHash = hashVerificationToken(rawToken);
	const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

	await EmailVerificationToken.deleteMany({
		$or: [{ user: userId }, { email: normalizedEmail }],
	});

	await EmailVerificationToken.create({
		user: userId,
		email: normalizedEmail,
		tokenHash,
		expiresAt,
	});

	return {
		token: rawToken,
		expiresAt,
	};
}

export async function sendVerificationEmail({
	userId,
	firstName,
	email,
}: VerificationEmailInput) {
	const normalizedEmail = normalizeEmail(email);
	const { token, expiresAt } = await createEmailVerificationToken({
		userId,
		email: normalizedEmail,
	});

	const verificationUrl = buildVerificationUrl(normalizedEmail, token);
	const emailContent = buildVerificationEmail({
		firstName: firstName?.trim() || 'there',
		email: normalizedEmail,
		verificationUrl,
	});

	await sendMail({
		to: normalizedEmail,
		subject: emailContent.subject,
		text: emailContent.text,
		html: emailContent.html,
	});

	return {
		expiresAt,
		verificationUrl,
	};
}

export async function verifyEmailToken({
	email,
	token,
}: VerifyEmailTokenInput): Promise<VerifyEmailTokenResult> {
	const normalizedEmail = normalizeEmail(email);
	const rawToken = token.trim();
	const now = new Date();

	if (!normalizedEmail || !rawToken) {
		return { status: 'invalid' };
	}

	const user = await User.findOne({ email: normalizedEmail });
	if (!user) {
		return { status: 'invalid' };
	}

	if (user.emailVerified) {
		await EmailVerificationToken.deleteMany({ user: user._id });
		return { status: 'already_verified' };
	}

	const tokenHash = hashVerificationToken(rawToken);

	const verificationToken = await EmailVerificationToken.findOne({
		user: user._id,
		email: normalizedEmail,
		tokenHash,
		expiresAt: { $gt: now },
	});

	if (!verificationToken) {
		await EmailVerificationToken.deleteMany({
			user: user._id,
			expiresAt: { $lte: now },
		});

		return { status: 'invalid' };
	}

	user.emailVerified = now;
	await user.save();

	await EmailVerificationToken.deleteMany({ user: user._id });

	return { status: 'verified' };
}
