'use client';
import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { Button, Typography, Box, TextField, Paper } from '@mui/material';

export default function SignInPage() {
    const [providers, setProviders] = useState(null);
    const [loginError, setLoginError] = useState(null);

    useEffect(() => {
        const loadProviders = async () => {
            const authProviders = await getProviders();
            setProviders(authProviders);
        };
        loadProviders();
    }, []);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h4" gutterBottom textAlign="center">Sign In</Typography>

                {loginError && (
                    <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
                        {loginError}
                    </Typography>
                )}

                {providers && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {providers.google && (
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => signIn(providers.google.id)}
                                sx={{ mt: 2 }}
                            >
                                Sign in with Google
                            </Button>
                        )}

                        {providers.credentials && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const email = e.target.email.value;
                                    const password = e.target.password.value;
                                    signIn('credentials', { redirect: false, email, password })
                                        .then((res) => {
                                            if (res?.ok) {
                                                window.location.href = '/';
                                            } else {
                                                setLoginError("Invalid email or password. Please try again.");
                                            }
                                        });
                                }}
                            >
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    fullWidth
                                    required
                                    margin="normal"
                                    aria-label="Email"
                                />
                                <TextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    fullWidth
                                    required
                                    margin="normal"
                                    aria-label="Password"
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
                            </form>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}