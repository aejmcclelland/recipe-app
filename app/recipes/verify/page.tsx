export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import connectDB from '@/config/database';

type VerifyPageProps = {
	searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
	const sp = await searchParams;
	const tokenParam = sp?.token;
	const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

	if (!token) return redirect('/recipes/verify/invalid');

	try {
		await connectDB();
		const User = (await import('@/models/User')).default;

		if (!process.env.JWT_SECRET) {
			console.error('[verify] Missing JWT_SECRET');
			return redirect('/recipes/verify/invalid');
		}

		let decoded: { email?: string };
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET) as { email?: string };
		} catch (e: any) {
			console.error('[verify] jwt.verify failed', {
				name: e?.name,
				message: e?.message,
			});
			return redirect('/recipes/verify/invalid');
		}

		const email = String(decoded?.email ?? '').toLowerCase().trim();
		if (!email || !email.includes('@')) return redirect('/recipes/verify/invalid');

		const user = await User.findOne({ email }).select('_id emailVerified').lean();
		if (!user) return redirect('/recipes/verify/invalid');

		// Already verified
		if (user.emailVerified) return redirect('/recipes/verify/success');

		await User.updateOne({ email }, { $set: { emailVerified: new Date() } });

		return redirect('/recipes/verify/success');
	} catch (err: any) {
		if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
		console.error('Verification error:', err);
		return redirect('/recipes/verify/invalid');
	}
}
