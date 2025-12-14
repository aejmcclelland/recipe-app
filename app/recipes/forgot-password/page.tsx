'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	Box,
	Button,
	Container,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { requestPasswordReset } from '@/app/actions/requestPasswordReset';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const trimmed = email.trim().toLowerCase();
		if (!trimmed || !trimmed.includes('@')) {
			toast.error('Please enter a valid email address.');
			return;
		}

		setSubmitting(true);

		try {
			// Important: always show a generic success message regardless of whether the email exists.
			await requestPasswordReset(trimmed);

			toast.success(
				'If an account exists for that email, we’ve sent a password reset link. Please check your inbox (and spam folder).'
			);
			setEmail('');
		} catch {
			// Same generic message to avoid leaking account existence.
			toast.success(
				'If an account exists for that email, we’ve sent a password reset link. Please check your inbox (and spam folder).'
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section>
			<Container
				maxWidth='sm'
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
					p: 3,
				}}>
				<Paper sx={{ p: 4, width: '100%', maxWidth: 520 }}>
					<Stack spacing={2}>
						<Box>
							<Typography variant='h5' component='h1' gutterBottom>
								Reset your password
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								Enter your email address and we’ll send you a password reset
								link.
							</Typography>
						</Box>

						<Box component='form' onSubmit={handleSubmit}>
							<Stack spacing={2}>
								<TextField
									label='Email'
									type='email'
									autoComplete='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									fullWidth
								/>

								<Button
									type='submit'
									variant='contained'
									disabled={submitting}
									sx={{ textTransform: 'none', py: 1.25 }}>
									{submitting ? 'Sending…' : 'Send reset link'}
								</Button>
							</Stack>
						</Box>

						<Typography variant='body2' color='text.secondary'>
							Remembered your password?{' '}
							<Link
								href='/recipes/signin'
								style={{ textDecoration: 'underline' }}>
								Back to sign in
							</Link>
						</Typography>
					</Stack>
				</Paper>
			</Container>
		</section>
	);
}
