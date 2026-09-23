import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import ResendVerificationForm from '@/components/ResendVerificationForm';
import { sanitiseEmail } from '@/utils/emailVerification';

type CheckEmailPageProps = Readonly<{
	searchParams: Promise<Readonly<{
		email?: string | string[];
		sent?: string | string[];
	}>>;
}>;

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
	const params = await searchParams;
	const emailParam = params.email;
	const sentParam = params.sent;

	const email = sanitiseEmail(
		Array.isArray(emailParam) ? emailParam[0] : emailParam,
	);
	const emailSent =
		(Array.isArray(sentParam) ? sentParam[0] : sentParam) !== '0';

	return (
		<Box
			data-testid='verify-check-email'
			sx={{ mt: 10, px: 2, textAlign: 'center' }}>
			<Typography variant='h4' gutterBottom>
				{emailSent ? 'Check your email' : 'Verify your email'}
			</Typography>

			<Typography variant='body1' sx={{ mb: 2 }}>
				{emailSent
					? `We’ve sent a verification link${email ? ` to ${email}` : ''}.`
					: `Your account was created, but we could not send the verification email${email ? ` to ${email}` : ''} just now.`}
			</Typography>

			<Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
				{emailSent
					? 'Verify your email before signing in. If the message doesn’t arrive, check spam or junk and request a fresh link below.'
					: 'You’ll need to verify your email before signing in. Use the resend button below to try again.'}
			</Typography>

			<ResendVerificationForm initialEmail={email} />

			<Stack
				direction='row'
				spacing={2}
				justifyContent='center'
				sx={{ mt: 4, flexWrap: 'wrap' }}>
				<Link href='/recipes/signin' passHref>
					<Button variant='contained'>Go to Sign In</Button>
				</Link>
				<Link href='/recipes/register' passHref>
					<Button variant='text'>Back to Register</Button>
				</Link>
			</Stack>
		</Box>
	);
}
