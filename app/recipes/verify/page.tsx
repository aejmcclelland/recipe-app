export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import connectDB from '@/config/database';
import { normalizeEmail, verifyEmailToken } from '@/utils/emailVerification';

type VerifyPageProps = {
	searchParams: Promise<{
		email?: string | string[];
		token?: string | string[];
	}>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
	const sp = await searchParams;
	const emailParam = sp?.email;
	const tokenParam = sp?.token;
	const email = normalizeEmail(Array.isArray(emailParam) ? emailParam[0] : emailParam);
	const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

	const invalidRedirect = email
		? `/recipes/verify/invalid?email=${encodeURIComponent(email)}`
		: '/recipes/verify/invalid';

	if (!token || !email) return redirect(invalidRedirect);

	try {
		await connectDB();

		const result = await verifyEmailToken({ email, token });

		if (result.status === 'invalid') {
			return redirect(invalidRedirect);
		}

		return redirect('/recipes/verify/success');
	} catch (err: any) {
		if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
		console.error('Verification error:', err);
		return redirect(invalidRedirect);
	}
}
