'use client';
import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { Button, Typography, Box, TextField, Paper } from '@mui/material';

export default function SignInPage() {
    const [providers, setProviders] = useState(null);

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

                {providers && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Google Sign-In Button */}
                        {providers.google && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => signIn(providers.google.id)}
                            >
                                Sign in with Google
                            </Button>
                        )}

                        {/* Email/Password Sign-In Form */}
                        {providers.credentials && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // Call signIn function with 'credentials' provider id
                                    const email = e.target.email.value;
                                    const password = e.target.password.value;
                                    signIn('credentials', { redirect: false, email, password });
                                }}
                            >
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <TextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    fullWidth
                                    required
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
                            </form>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}