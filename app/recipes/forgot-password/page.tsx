'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
	Alert,
	Box,
	Button,
	Container,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { requestPasswordReset } from '@/app/actions/requestPasswordReset';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [accepted, setAccepted] = useState(false);
	const [error, setError] = useState('');
	const pending = useRef(false);
	const focusEmail = useRef(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (pending.current) return;
		setError('');

		const trimmed = email.trim().toLowerCase();
		if (!trimmed || !trimmed.includes('@')) {
			setError('Please enter a valid email address.');
			return;
		}

		pending.current = true;
		setSubmitting(true);
		try {
			const result = await requestPasswordReset(trimmed);
			if (result.ok === true) {
				setAccepted(true);
			} else {
				setError(result.error === 'RATE_LIMITED'
					? 'Too many requests. Please try again later.'
					: 'We couldn’t process your request right now. Please try again.');
			}
		} catch {
			setError('We couldn’t process your request right now. Please try again.');
		} finally {
			pending.current = false;
			setSubmitting(false);
		}
	}

	return (
		<section data-testid="forgot-password-page">
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
						{accepted ? (
							<>
								<Box role="status">
									<Typography variant="h5" component="h1" gutterBottom tabIndex={-1} ref={(heading) => heading?.focus()}>
										Check your email
									</Typography>
									<Typography variant="body2">
										If an account exists for that email address, we’ve sent password reset instructions.
									</Typography>
									<Typography variant="body2" sx={{ mt: 2 }}>
										Follow the link in the email to choose a new password. It may take a few minutes to arrive; check your spam or junk folder too.
									</Typography>
								</Box>
								<Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => {
									focusEmail.current = true;
									setAccepted(false);
									setError('');
								}}>
									Send another link
								</Button>
							</>
						) : (
							<>
								<Box>
									<Typography variant='h5' component='h1' gutterBottom>
										Reset your password
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										Enter your email address and we’ll send you a password reset
										link.
									</Typography>
								</Box>

								{error && <Alert severity="error">{error}</Alert>}
								<Box component='form' onSubmit={handleSubmit} aria-busy={submitting}>
									<Stack spacing={2}>
										<TextField
											label='Email'
											disabled={submitting}
											inputRef={(input: HTMLInputElement | null) => {
												if (input && focusEmail.current) {
													input.focus();
													focusEmail.current = false;
												}
											}}
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
							</>
						)}
						<Typography variant='body2' color='text.secondary'>
							{!accepted && <>Remembered your password?{' '}</>}
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
