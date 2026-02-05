// app/recipes/verify/success/page.tsx
'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function VerifySuccessPage() {
	return (
		<Box data-testid='verify-success' sx={{ mt: 10, textAlign: 'center' }}>
			<Typography variant='h4' gutterBottom>
				Email Verified
			</Typography>
			<Typography variant='body1' sx={{ mb: 3 }}>
				Your email has been successfully verified. You can now log in and start
				using your account.
			</Typography>
			<Link href='/recipes/signin' passHref>
				<Button variant='contained' color='primary'>
					Go to Sign In
				</Button>
			</Link>
		</Box>
	);
}
