import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import ResendVerificationForm from '@/components/ResendVerificationForm';
import { normalizeEmail } from '@/utils/emailVerification';

type CheckEmailPageProps = Readonly<{
	searchParams?: Readonly<{
		email?: string | string[];
		sent?: string | string[];
	}>;
}>;

export default function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
	const emailParam = searchParams?.email;
	const sentParam = searchParams?.sent;

	const email = normalizeEmail(
		Array.isArray(emailParam) ? emailParam[0] : emailParam,
	);
	const emailSent =
		(Array.isArray(sentParam) ? sentParam[0] : sentParam) !== '0';

	return (
		<Box
			data-testid='verify-check-email'
			sx={{ mt: 10, px: 2, textAlign: 'center' }}>
			<Typography variant='h4' gutterBottom>
				Check your email
			</Typography>

			<Typography variant='body1' sx={{ mb: 2 }}>
				{emailSent
					? `We’ve sent a verification link${email ? ` to ${email}` : ''}.`
					: 'Your account was created, but we could not send the verification email just yet.'}
			</Typography>

			<Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
				Verify your email before signing in. If the message doesn&apos;t arrive,
				check spam or junk and request a fresh link below.
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
