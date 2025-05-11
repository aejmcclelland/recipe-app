import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import connectDB from '@/config/database';

export default async function VerifyPage({
	searchParams,
}: {
	searchParams: { token?: string };
}) {
	// ✅ NEW: await searchParams to avoid sync error
	const params = searchParams;
	const token = params?.token;

	if (!token) return redirect('/recipes/verify/invalid');

	try {
		await connectDB();
		const User = (await import('@/models/User')).default;

		const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
		console.log('Decoded token:', decoded);

		const normalizedEmail = decoded.email.toLowerCase().trim();
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) return redirect('/recipes/verify/invalid');

		console.log('User found:', user.email, 'Verified:', user.verified);

		if (user.verified) return redirect('/recipes/verify/success');

		const result = await User.updateOne(
			{ email: normalizedEmail },
			{ $set: { verified: true } }
		);
		console.log('Update result:', result);

		return redirect('/recipes/verify/success');
	} catch (err: any) {
		// Don't accidentally catch internal Next redirects
		if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;

		console.error('Verification error:', err);
		return redirect('/recipes/verify/invalid');
	}
}
