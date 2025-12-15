// components/SignInForm.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getProviders } from 'next-auth/react';
import {
	Button,
	Typography,
	Box,
	TextField,
	Paper,
	Divider,
	Stack,
	Link as MuiLink,
	InputAdornment,
} from '@mui/material';
import { toast } from 'react-toastify';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resendVerificationEmail } from '@/app/actions/resendVerificationEmail';
import GoogleButton from '@/components/GoogleButton';

export default function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const registered = searchParams.get('registered') === '1';
	const verifyPending = searchParams.get('verify') === '1';

	const [providers, setProviders] = useState(null);
	const [loginError, setLoginError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [needsVerification, setNeedsVerification] = useState(false);

	// Dropbox-style: email first, then password
	const [step, setStep] = useState(1); // 1 = email, 2 = password
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
	const canContinue = trimmedEmail.length > 3 && trimmedEmail.includes('@');
	const canSubmit = canContinue && password.length > 0;

	useEffect(() => {
		const loadProviders = async () => {
			const authProviders = await getProviders();
			setProviders(authProviders);
		};
		loadProviders();

		// Display error if 'account_exists' is in query parameters
		if (searchParams.get('error') === 'account_exists') {
			toast.error(
				'An account with this email already exists. Please sign in with email and password.'
			);
		}

		// User tried to sign in before verifying their email
		if (searchParams.get('error') === 'EMAIL_NOT_VERIFIED') {
			toast.info(
				'Please verify your email address before signing in. Check your inbox (and spam folder) for the verification link.'
			);
		}
	}, [searchParams]);

	const handleGoogleSignIn = async () => {
		setLoginError(null);
		setIsLoading(true);
		try {
			// Use provider id from NextAuth
			await signIn(providers?.google?.id || 'google', { callbackUrl: '/recipes/profile' });
		} catch {
			setLoginError('There was an issue with Google Sign-In. Please try again.');
			setIsLoading(false);
		}
	};

	const handleContinue = (e) => {
		e.preventDefault();
		setLoginError(null);
		setNeedsVerification(false);

		if (!canContinue) {
			setLoginError('Please enter a valid email address.');
			return;
		}
		setStep(2);
	};

	const handleEmailSignIn = async (e) => {
		e.preventDefault();
		setLoginError(null);

		if (!canSubmit) {
			setLoginError('Please enter your password.');
			return;
		}

		setIsLoading(true);
		const res = await signIn('credentials', {
			redirect: false,
			email: trimmedEmail,
			password,
		});
		setIsLoading(false);

		if (res?.ok) {
			router.push('/recipes/profile');
			return;
		}

		if (res?.error === 'EMAIL_NOT_VERIFIED') {
			setNeedsVerification(true);
			setLoginError('Please verify your email before signing in. You can resend the verification link below.');
			return;
		}

		setLoginError('Invalid email or password. Please try again.');
	};

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
			<Paper sx={{ p: 4, width: '100%', maxWidth: 420, textAlign: 'center' }}>
				<Typography variant="h4" gutterBottom>
					Sign in to Rebekah’s Recipes
				</Typography>

				{(registered || verifyPending) && !needsVerification && (
					<Typography color="success.main" sx={{ textAlign: 'center', mb: 2 }}>
						Account created — please verify your email before signing in. We’ve sent you a verification link.
					</Typography>
				)}

				{loginError && (
					<Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
						{loginError}
					</Typography>
				)}

				{providers ? (
					<Stack spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
						{/* Google sign-in */}
						{providers.google && (
							<GoogleButton
								onClick={handleGoogleSignIn}
								disabled={isLoading}
							/>
						)}

						<Divider>or</Divider>

						{/* Step 1: email */}
						{providers.credentials && step === 1 && (
							<Box
								component="form"
								onSubmit={handleContinue}
								sx={{ width: '100%', maxWidth: 320 }}
							>
								<Stack spacing={2}>
									<TextField
										label="Email"
										name="email"
										type="email"
										required
										fullWidth
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setNeedsVerification(false);
										}}
										autoComplete="email"
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<MailOutlineIcon fontSize="small" />
													</InputAdornment>
												),
											},
										}}
									/>

									<Button
										variant="contained"
										type="submit"
										fullWidth
										sx={{ textTransform: 'none' }}
										disabled={isLoading || !canContinue}
									>
										Continue
									</Button>
								</Stack>
							</Box>
						)}

						{/* Step 2: password */}
						{providers.credentials && step === 2 && (
							<Box
								component="form"
								onSubmit={handleEmailSignIn}
								sx={{ width: '100%', maxWidth: 320 }}
							>
								<Stack spacing={2}>
									<TextField
										label="Password"
										name="password"
										type="password"
										required
										fullWidth
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										autoComplete="current-password"
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<LockOutlinedIcon fontSize="small" />
													</InputAdornment>
												),
											},
										}}
									/>

									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<MuiLink href="/recipes/forgot-password" underline="hover" variant="body2">
											Forgotten your password?
										</MuiLink>
									</Stack>
									{needsVerification && (
										<Button
											variant="outlined"
											disabled={isLoading || !canContinue}
											onClick={async () => {
												try {
													setIsLoading(true);
													await resendVerificationEmail(trimmedEmail);
													toast.success("If your account exists and isn't verified, we've sent a new verification email.");
												} finally {
													setIsLoading(false);
												}
											}}
											sx={{ textTransform: 'none' }}
										>
											Resend verification email
										</Button>
									)}
									<Button
										variant="contained"
										type="submit"
										fullWidth
										sx={{ textTransform: 'none' }}
										disabled={isLoading || !canSubmit}
									>
										{isLoading ? 'Signing in…' : 'Continue'}
									</Button>
								</Stack>
							</Box>
						)}

						{/* Sign up link */}
						<Box sx={{ mt: 1 }}>
							<Typography variant="body2" color="textSecondary">
								Don&apos;t have an account?{' '}
								<Link href="/recipes/register" passHref>
									<Typography
										component="span"
										sx={{
											color: 'primary.main',
											textDecoration: 'underline',
											cursor: 'pointer',
										}}
									>
										Register
									</Typography>
								</Link>
							</Typography>
						</Box>
					</Stack>
				) : (
					<Typography variant="body2" color="text.secondary">
						Loading sign-in options…
					</Typography>
				)}
			</Paper>
		</Box>
	);
}