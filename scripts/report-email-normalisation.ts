import 'dotenv/config';

import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import mongoose, { type Types } from 'mongoose';

const require = createRequire(import.meta.url);
const DEFAULT_SUSPICIOUS_AGE_DAYS = 7;
const SUSPICIOUS_SIGNAL_THRESHOLD = 4;
const RANDOM_NAME_MINIMUM_LENGTH = 15;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const RANDOM_NAME_PATTERN = new RegExp(
	`^[a-z]{${RANDOM_NAME_MINIMUM_LENGTH},}$`,
	'i'
);

type UserRecord = {
	_id: Types.ObjectId;
	email?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	createdAt?: Date | string | null;
	emailVerified?: Date | string | null;
	authProvider?: string | null;
	bookmarks?: unknown[] | null;
};

type RecipeCount = {
	_id: Types.ObjectId;
	recipeCount: number;
};

type EmailVerifiedStatus = {
	isVerified: boolean;
	verifiedAt: string | null;
};

type ReportUser = {
	userId: string;
	originalEmail: string | null;
	normalisedEmail: string | null;
	firstName: string | null;
	lastName: string | null;
	createdAt: string | null;
	emailVerified: EmailVerifiedStatus;
	authProvider: string | null;
	bookmarkCount: number;
	recipeCount: number;
};

function parseSuspiciousAgeDays() {
	const equalsArgument = process.argv.find((argument) =>
		argument.startsWith('--older-than-days=')
	);
	const argumentIndex = process.argv.indexOf('--older-than-days');
	const argumentValue =
		equalsArgument?.slice('--older-than-days='.length) ??
		(argumentIndex >= 0 ? process.argv[argumentIndex + 1] : undefined);
	const configuredValue =
		argumentValue ??
		process.env.SUSPICIOUS_USER_AGE_DAYS ??
		String(DEFAULT_SUSPICIOUS_AGE_DAYS);
	const parsedValue = Number(configuredValue);

	if (!Number.isInteger(parsedValue) || parsedValue < 0) {
		throw new Error(
			'The suspicious user age must be a non-negative integer.'
		);
	}

	return parsedValue;
}

export function normaliseEmail(email: string) {
	const trimmedEmail = email.trim().toLowerCase();
	const separatorIndex = trimmedEmail.lastIndexOf('@');

	if (separatorIndex < 0) {
		return trimmedEmail;
	}

	const localPart = trimmedEmail.slice(0, separatorIndex);
	const domain = trimmedEmail.slice(separatorIndex + 1);

	if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
		return trimmedEmail;
	}

	const gmailLocalPart = localPart.split('+', 1)[0].replaceAll('.', '');
	return `${gmailLocalPart}@gmail.com`;
}

function toIsoString(value: Date | string | null | undefined) {
	if (!value) return null;

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function looksRandomlyGenerated(value: string | null | undefined) {
	return RANDOM_NAME_PATTERN.test(value?.trim() ?? '');
}

function buildReportUser(
	user: UserRecord,
	normalisedEmail: string | null,
	recipeCount: number
): ReportUser {
	return {
		userId: user._id.toString(),
		originalEmail: typeof user.email === 'string' ? user.email : null,
		normalisedEmail,
		firstName: typeof user.firstName === 'string' ? user.firstName : null,
		lastName: typeof user.lastName === 'string' ? user.lastName : null,
		createdAt: toIsoString(user.createdAt),
		emailVerified: {
			isVerified: Boolean(user.emailVerified),
			verifiedAt: toIsoString(user.emailVerified),
		},
		authProvider:
			typeof user.authProvider === 'string' ? user.authProvider : null,
		bookmarkCount: Array.isArray(user.bookmarks) ? user.bookmarks.length : 0,
		recipeCount,
	};
}

async function run() {
	const suspiciousAgeDays = parseSuspiciousAgeDays();
	const now = new Date();
	const suspiciousCreatedBefore = new Date(
		now.getTime() - suspiciousAgeDays * DAY_IN_MILLISECONDS
	);

	// Prevent model initialisation from creating collections or indexes.
	mongoose.set('autoCreate', false);
	mongoose.set('autoIndex', false);

	const connectDB = require('../config/database.ts')
		.default as typeof import('../config/database').default;
	const User = require('../models/User.ts')
		.default as typeof import('../models/User').default;
	const Recipe = require('../models/Recipe.ts')
		.default as typeof import('../models/Recipe').default;

	await connectDB();

	const users = (await User.find({})
		.select(
			'_id email firstName lastName createdAt emailVerified authProvider bookmarks'
		)
		.lean()
		.read('secondaryPreferred')
		.exec()) as unknown as UserRecord[];

	const recipeCounts = await Recipe.aggregate<RecipeCount>([
		{ $match: { user: { $ne: null } } },
		{ $group: { _id: '$user', recipeCount: { $sum: 1 } } },
	]).read('secondaryPreferred');
	const recipeCountByUserId = new Map(
		recipeCounts.map(({ _id, recipeCount }) => [
			_id.toString(),
			recipeCount,
		])
	);

	const usersByNormalisedEmail = new Map<string, ReportUser[]>();
	const reportUsers = users.map((user) => {
		const normalisedEmail =
			typeof user.email === 'string' && user.email.trim()
				? normaliseEmail(user.email)
				: null;
		const reportUser = buildReportUser(
			user,
			normalisedEmail,
			recipeCountByUserId.get(user._id.toString()) ?? 0
		);

		if (normalisedEmail) {
			const matchingUsers =
				usersByNormalisedEmail.get(normalisedEmail) ?? [];
			matchingUsers.push(reportUser);
			usersByNormalisedEmail.set(normalisedEmail, matchingUsers);
		}

		return reportUser;
	});

	const collisions = [...usersByNormalisedEmail.entries()]
		.filter(([, matchingUsers]) => matchingUsers.length > 1)
		.map(([normalisedEmail, matchingUsers]) => ({
			normalisedEmail,
			users: matchingUsers,
		}))
		.sort((left, right) =>
			left.normalisedEmail.localeCompare(right.normalisedEmail)
		);

	const suspiciousUsers = reportUsers
		.map((user) => {
			const createdAt = user.createdAt ? new Date(user.createdAt) : null;
			const reasons: string[] = [];

			if (!user.emailVerified.isVerified) reasons.push('email_unverified');
			if (user.authProvider !== 'google') {
				reasons.push('auth_provider_not_google');
			}
			if (user.bookmarkCount === 0) reasons.push('no_bookmarks');
			if (user.recipeCount === 0) reasons.push('no_recipes');
			if (
				looksRandomlyGenerated(user.firstName) ||
				looksRandomlyGenerated(user.lastName)
			) {
				reasons.push('random_looking_name');
			}
			if (createdAt && createdAt < suspiciousCreatedBefore) {
				reasons.push('account_older_than_cutoff');
			}

			return {
				...user,
				ageDays: createdAt
					? Math.floor(
							(now.getTime() - createdAt.getTime()) /
								DAY_IN_MILLISECONDS
						)
					: null,
				suspiciousSignalCount: reasons.length,
				suspiciousReasons: reasons,
			};
		})
		.filter(
			(user) =>
				user.suspiciousSignalCount >= SUSPICIOUS_SIGNAL_THRESHOLD
		)
		.sort(
			(left, right) =>
				right.suspiciousSignalCount - left.suspiciousSignalCount ||
				(left.createdAt ?? '').localeCompare(right.createdAt ?? '')
		);

	const report = {
		generatedAt: now.toISOString(),
		configuration: {
			suspiciousAgeDays,
			suspiciousCreatedBefore: suspiciousCreatedBefore.toISOString(),
			suspiciousSignalThreshold: SUSPICIOUS_SIGNAL_THRESHOLD,
			randomNameRule: `alphabetic string at least ${RANDOM_NAME_MINIMUM_LENGTH} characters long`,
		},
		summary: {
			totalUsers: users.length,
			totalUsersWithCalculatedNormalisedEmails: reportUsers.filter(
				(user) => user.normalisedEmail
			).length,
			normalisedEmailCollisions: collisions.length,
			suspiciousUsers: suspiciousUsers.length,
		},
		collisions,
		suspiciousUsers,
	};

	const outputPath = path.resolve(
		process.cwd(),
		'reports/email-normalisation-report.json'
	);
	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

	console.log('Email normalisation report complete');
	console.log(`Total users: ${report.summary.totalUsers}`);
	console.log(
		`Users with calculated normalised emails: ${report.summary.totalUsersWithCalculatedNormalisedEmails}`
	);
	console.log(
		`Normalised email collisions: ${report.summary.normalisedEmailCollisions}`
	);
	console.log(`Suspicious users: ${report.summary.suspiciousUsers}`);
	console.log(`Output: ${outputPath}`);
}

try {
	await run();
} catch (error) {
	const message = error instanceof Error ? error.message : 'Unknown error';
	console.error(`Email normalisation report failed: ${message}`);
	process.exitCode = 1;
} finally {
	await mongoose.disconnect();
}
