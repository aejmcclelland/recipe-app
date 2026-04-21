import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import ResendVerificationForm from '@/components/ResendVerificationForm';
import { normalizeEmail } from '@/utils/emailVerification';

type VerifyInvalidPageProps = {
	searchParams: Promise<{ email?: string | string[] }>;
};

export default async function VerifyInvalidPage({
	searchParams,
}: VerifyInvalidPageProps) {
	const sp = await searchParams;
	const emailParam = sp?.email;
	const email = normalizeEmail(Array.isArray(emailParam) ? emailParam[0] : emailParam);

	return (
		<Box data-testid='verify-invalid' sx={{ mt: 10, textAlign: 'center' }}>
			<Typography variant='h4' color='error' gutterBottom>
				Verification link expired
			</Typography>
			<Typography variant='body1' sx={{ mb: 4, px: 2 }}>
				That verification link is invalid, expired, or has already been
				replaced. Request a fresh verification email below.
			</Typography>

			<ResendVerificationForm initialEmail={email} />

			<Stack
				direction='row'
				spacing={2}
				justifyContent='center'
				sx={{ mt: 4, flexWrap: 'wrap' }}
			>
				<Link href='/recipes/signin' passHref>
					<Button variant='contained' color='primary'>
						Go to Sign In
					</Button>
				</Link>
				<Link href='/recipes/register' passHref>
					<Button variant='text'>Back to Register</Button>
				</Link>
			</Stack>
		</Box>
	);
}
