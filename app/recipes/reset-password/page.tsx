'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { resetPassword } from '@/app/actions/resetPassword';

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
	const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!email || !token) {
			toast.error('Reset link is missing or invalid.');
			return;
		}
		if (password.length < 8) {
			toast.error('Password must be at least 8 characters.');
			return;
		}
		if (password !== confirm) {
			toast.error('Passwords do not match.');
			return;
		}

		setSubmitting(true);
		try {
			await resetPassword({ email, token, password });
			toast.success('Password updated. Please sign in.');
			router.push('/recipes/signin');
		} catch (err: any) {
			toast.error(err?.message || 'Reset link is invalid or has expired.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section>
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
						<Typography variant="h5" component="h1">
							Choose a new password
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Set a new password for <strong>{email || 'your account'}</strong>.
						</Typography>

						<Box component="form" onSubmit={handleSubmit}>
							<Stack spacing={2}>
								<TextField
									label="New password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="new-password"
									required
									fullWidth
								/>
								<TextField
									label="Confirm new password"
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
