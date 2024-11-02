'use client';
import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { Button, Typography, Box, TextField, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SignInForm() {
    const searchParams = useSearchParams();
    const [providers, setProviders] = useState(null);
    const [loginError, setLoginError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadProviders = async () => {
            const authProviders = await getProviders();
            setProviders(authProviders);
        };
        loadProviders();

        // Check if there is an 'error' query parameter
        if (searchParams.get('error') === 'account_exists') {
            toast.error('An account with this email already exists. Please sign in with email and password.');
        }
    }, [searchParams]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Sign In
                </Typography>

                {loginError && (
                    <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
                        {loginError}
                    </Typography>
                )}

                {providers && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, alignItems: 'center' }}>
                        {providers.google && (
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={isLoading}
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        await signIn(providers.google.id, { callbackUrl: '/' });
                                    } catch (error) {
                                        setLoginError("There was an issue with Google Sign-In. Please try again.");
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                sx={{ mt: 2, width: '100%', maxWidth: 300 }}
                            >
                                {isLoading ? "Signing in..." : "Sign in with Google"}
                            </Button>
                        )}

                        {providers.credentials && (
                            <Box
                                component="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const email = e.target.email.value;
                                    const password = e.target.password.value;
                                    signIn('credentials', { redirect: false, email, password, callbackUrl: '/' })
                                        .then((res) => {
                                            if (res?.ok) {
                                                window.location.href = '/';
                                            } else {
                                                setLoginError("Invalid email or password. Please try again.");
                                            }
                                        });
                                }}
                                sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 300, gap: 2 }}
                            >
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    required
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    required
                                    fullWidth
                                    margin="normal"
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    Sign in with Email
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                <Box sx={{ mt: 3 }}>
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
            </Paper>
        </Box>
    );
}