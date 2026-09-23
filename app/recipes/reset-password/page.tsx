'use client';

import { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { toast } from 'react-toastify';
import { resetPassword } from '@/app/actions/resetPassword';

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const email = (searchParams.get('email') || '').trim();
	const token = (searchParams.get('token') || '').trim();
	const missingLink = !email || !token;

	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const pending = useRef(false);
	const [error, setError] = useState('');
	const [invalidLink, setInvalidLink] = useState(false);
	const [passwordError, setPasswordError] = useState('');
	const [confirmError, setConfirmError] = useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (pending.current || missingLink || invalidLink) return;
		setError('');
		setPasswordError('');
		setConfirmError('');

		if (password.length < 8) {
			setPasswordError('Password must be at least 8 characters.');
			return;
		}
		if (password !== confirm) {
			setConfirmError('Passwords do not match.');
			return;
		}

		pending.current = true;
		setSubmitting(true);
		try {
			const result = await resetPassword({ email, token, password });
			if (result.ok === true) {
				toast.success('Password updated. Please sign in.');
				router.push('/recipes/signin');
			} else if (result.error === 'INVALID_LINK') {
				setInvalidLink(true);
				setPassword('');
				setConfirm('');
			} else if (result.error === 'INVALID_PASSWORD') {
				setPasswordError('Password must be at least 8 characters.');
			} else {
				setError(result.error === 'RATE_LIMITED'
					? 'Too many attempts. Please try again later.'
					: 'We couldn’t update your password right now. Please try again.');
			}
		} catch {
			setError('We couldn’t update your password right now. Please try again.');
		} finally {
			pending.current = false;
			setSubmitting(false);
		}
	}

	return (
		<section data-testid="reset-password-page">
			<Container
				maxWidth="sm"
				sx={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					p: 3,
				}}
			>
				<Paper sx={{ p: 4, width: '100%', maxWidth: 520 }}>
					<Stack spacing={2}>
						{missingLink || invalidLink ? (
							<>
								<Typography variant="h5" component="h1">Request a new reset link</Typography>
								<Alert severity="error">
									{missingLink
										? 'You need a valid password-reset link to choose a new password. Please request a new link.'
										: 'This password-reset link is no longer valid. Please request a new link.'}
								</Alert>
								<Button component={Link} href="/recipes/forgot-password" variant="contained" sx={{ textTransform: 'none' }}>
									Request a new reset link
								</Button>
							</>
						) : (
							<>
								<Typography variant="h5" component="h1">
									Choose a new password
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Set a new password for <strong>{email || 'your account'}</strong>.
								</Typography>

								{error && <Alert severity="error">{error}</Alert>}
								<Box component="form" onSubmit={handleSubmit} aria-busy={submitting}>
									<Stack spacing={2}>
										<TextField
											label="New password"
											disabled={submitting}
											error={Boolean(passwordError)}
											helperText={passwordError || "Use at least 8 characters."}
											type="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											autoComplete="new-password"
											required
											fullWidth
										/>
										<TextField
											label="Confirm new password"
											disabled={submitting}
											error={Boolean(confirmError)}
											helperText={confirmError}
											type="password"
											value={confirm}
											onChange={(e) => setConfirm(e.target.value)}
											autoComplete="new-password"
											required
											fullWidth
										/>
										<Button
											type="submit"
											variant="contained"
											disabled={submitting}
											sx={{ textTransform: 'none', py: 1.25 }}
										>
											{submitting ? 'Updating…' : 'Update password'}
										</Button>
									</Stack>
								</Box>
							</>
						)}
					</Stack>
				</Paper>
			</Container>
		</section>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center',justifyContent: 'center', p: 3 }}>
					<Paper sx={{ p: 4, width: '100%', maxWidth: 520 }}>
						<Typography variant="body2" color="text.secondary">
							Loading…
						</Typography>
					</Paper>
				</Container>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
}
