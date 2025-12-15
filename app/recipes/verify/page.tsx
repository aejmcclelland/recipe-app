// app/recipes/verify/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import connectDB from '@/config/database';

type VerifyPageProps = {
	searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
	const params = await searchParams;
	const tokenParam = params?.token;
	const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

	if (!token) return redirect('/recipes/verify/invalid');

	try {
		await connectDB();
		const User = (await import('@/models/User')).default;
		if (!process.env.JWT_SECRET) {
			return redirect('/recipes/verify/invalid');
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as { email?: string };
		const email = String(decoded?.email ?? '').toLowerCase().trim();
		if (!email || !email.includes('@')) return redirect('/recipes/verify/invalid');

		const user = await User.findOne({ email }).select('_id emailVerified').lean();
		if (!user) return redirect('/recipes/verify/invalid');

		// Already verified
		if (user.emailVerified) return redirect('/recipes/verify/success');

		await User.updateOne(
			{ email },
			{ $set: { emailVerified: new Date() } }
		);

		return redirect('/recipes/verify/success');
	} catch (err: any) {
		if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
		console.error('Verification error:', err);
		return redirect('/recipes/verify/invalid');
	}
}
