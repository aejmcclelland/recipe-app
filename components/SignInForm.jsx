// components/SignInForm.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import {
	Alert,
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
import { getSignInDestination } from '@/utils/signInDestination';

function getSignInError(code) {
	if (!code) return null;
	switch (code) {
		case 'OAuthAccountNotLinked':
		case 'account_exists':
			return 'We couldn’t sign you in with Google. Try the sign-in method you originally used, or choose a different Google account.';
		case 'OAuthSignin':
		case 'OAuthCallback':
		case 'OAuthCreateAccount':
		case 'Callback':
		case 'AccessDenied':
			return 'Google sign-in wasn’t completed. Please try again, or sign in with email and password.';
		case 'CredentialsSignin':
			return 'Invalid email or password. Please check your details and try again.';
		case 'EMAIL_NOT_VERIFIED':
			return 'Please verify your email before signing in. Check your inbox and spam folder for the verification link.';
		case 'RATE_LIMITED':
			return 'Too many sign-in attempts. Please try again later.';
		case 'SERVICE_UNAVAILABLE':
		case 'Configuration':
			return 'Sign-in is temporarily unavailable. Please try again later.';
		case 'SessionRequired':
			return 'Please sign in to continue to that page.';
		default:
			return 'We couldn’t sign you in just now. Please try again.';
	}
}

export default function SignInForm() {
	const searchParams = useSearchParams();
	const registered = searchParams.get('registered') === '1';
	const verifyPending = searchParams.get('verify') === '1';

	const [providerState, setProviderState] = useState({ status: 'loading', providers: null });
	const [providerAttempt, setProviderAttempt] = useState(0);
	const providers = providerState.providers;
	const [loginError, setLoginError] = useState(null);
	const [pendingAction, setPendingAction] = useState(null);
	const isLoading = pendingAction !== null;
	const [needsVerification, setNeedsVerification] = useState(false);

	// Keep the two-step flow while allowing the email to be corrected.
	const [step, setStep] = useState(1); // 1 = email, 2 = password
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const shouldFocusEmail = useRef(false);
	const trimmedEmail = email.trim().toLowerCase();
	const displayedError = loginError ?? getSignInError(searchParams.get('error'));
	const destination = () => getSignInDestination(searchParams.get('callbackUrl'), window.location.origin);
	const canContinue = trimmedEmail.length > 3 && trimmedEmail.includes('@');
	const canSubmit = canContinue && password.length > 0;

	useEffect(() => {
		let active = true;
		const loadProviders = async () => {
			try {
				const result = await getProviders();
				if (!result?.google && !result?.credentials) throw new Error('Providers unavailable');
				if (active) setProviderState({ status: 'ready', providers: result });
			} catch {
				if (active) setProviderState({ status: 'error', providers: null });
			}
		};
		loadProviders();
		return () => { active = false; };
	}, [providerAttempt]);

	const handleChangeEmail = () => {
		shouldFocusEmail.current = true;
		setPassword('');
		setLoginError('');
		setNeedsVerification(false);
		setStep(1);
	};

	const handleGoogleSignIn = async () => {
		setLoginError('');
		setPendingAction('google');
		try {
			await signIn(providers?.google?.id || 'google', { callbackUrl: destination() });
		} catch {
			setLoginError('There was an issue with Google Sign-In. Please try again.');
		} finally {
			setPendingAction(null);
		}
	};

	const handleContinue = (e) => {
		e.preventDefault();
		setLoginError('');
		setNeedsVerification(false);

		if (!canContinue) {
			setLoginError('Please enter a valid email address.');
			return;
		}
		setStep(2);
	};

	const handleEmailSignIn = async (e) => {
		e.preventDefault();
		setLoginError('');

		if (!canSubmit) {
			setLoginError('Please enter your password.');
			return;
		}

		setPendingAction('credentials');
		setNeedsVerification(false);
		try {
			const callbackUrl = destination();
			const res = await signIn('credentials', {
				redirect: false,
				email: trimmedEmail,
				password,
				callbackUrl,
			});

			if (res?.status === 429 || res?.status === 503) {
				setLoginError(getSignInError(res.status === 429 ? 'RATE_LIMITED' : 'SERVICE_UNAVAILABLE'));
			} else if (res?.error === 'EMAIL_NOT_VERIFIED') {
				setNeedsVerification(true);
				setLoginError('Please verify your email before signing in. You can resend the verification link below.');
			} else if (res?.error) {
				setLoginError(getSignInError(res.error));
			} else if (res?.ok) {
				// Use our validated destination, not an arbitrary response URL. A fresh
				// page request also renders home using the newly established session.
				window.location.assign(callbackUrl);
			} else {
				setLoginError(getSignInError('SERVICE_UNAVAILABLE'));
			}
		} catch {
			setLoginError('We couldn’t connect to sign you in. Please try again.');
		} finally {
			setPendingAction(null);
		}
	};

	return (
		<Box
			data-testid="signin-page"
			sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}
		>
			<Paper sx={{ p: 4, width: '100%', maxWidth: 420, textAlign: 'center' }}>
				<Typography variant="h4" gutterBottom>
					Sign in to Rebekah’s Recipes
				</Typography>

				{(registered || verifyPending) && !needsVerification && (
					<Typography color="success.main" sx={{ textAlign: 'center', mb: 2 }}>
						Account created — please verify your email before signing in. We’ve sent you a verification link.
					</Typography>
				)}

				{displayedError && (
					<Alert severity="error" sx={{ textAlign: 'left', mb: 2 }}>
						{displayedError}
					</Alert>
				)}
				{pendingAction === 'google' && (
					<Typography variant="body2" role="status">Connecting to Google…</Typography>
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
										inputRef={(input) => {
											if (input && shouldFocusEmail.current) {
												input.focus();
												shouldFocusEmail.current = false;
											}
										}}
										type="email"
										required
										fullWidth
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setNeedsVerification(false);
										}}
										autoComplete="email"
										inputProps={{ 'data-testid': 'signin-email' }}
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

									<Button data-testid="signin-continue"
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
									<Box>
										<Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
											Signing in as <strong>{trimmedEmail}</strong>
										</Typography>
										<MuiLink component="button" type="button" onClick={handleChangeEmail} disabled={isLoading}>
											Change email
										</MuiLink>
									</Box>
									<TextField
										autoFocus
										label="Password"
										name="password"
										type="password"
										required
										fullWidth
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										autoComplete="current-password"
										inputProps={{ 'data-testid': 'signin-password' }}
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
										<Button data-testid="signin-resend-verification"
											variant="outlined"
											disabled={isLoading || !canContinue}
											onClick={async () => {
												try {
													setPendingAction('resend');
													await resendVerificationEmail(trimmedEmail);
													toast.success("If your account exists and isn't verified, we've sent a new verification email.");
												} catch {
													setLoginError('We couldn’t request that email just now. Please try again.');
												} finally {
													setPendingAction(null);
												}
											}}
											sx={{ textTransform: 'none' }}
										>
											{pendingAction === 'resend' ? 'Sending…' : 'Resend verification email'}
										</Button>
									)}
									<Button data-testid="signin-submit"
										variant="contained"
										type="submit"
										fullWidth
										sx={{ textTransform: 'none' }}
										disabled={isLoading || !canSubmit}
									>
										{pendingAction === 'credentials' ? 'Signing in…' : 'Sign in'}
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
				) : providerState.status === 'error' ? (
					<Stack spacing={2}>
						<Alert severity="error">We couldn’t load the sign-in options. Please try again.</Alert>
						<Button variant="outlined" onClick={() => {
							setProviderState({ status: 'loading', providers: null });
							setProviderAttempt(attempt => attempt + 1);
						}}>Try again</Button>
					</Stack>
				) : (
					<Typography variant="body2" color="text.secondary" role="status">
						Loading sign-in options…
					</Typography>
				)}
			</Paper>
		</Box>
	);
}
