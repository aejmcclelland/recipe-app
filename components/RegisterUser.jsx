'use client';
import { useState } from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            router.push('/recipes/signin');
        } else {
            console.error('Registration failed');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper
                sx={{
                    padding: 1,
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // Center the form content horizontally
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center', // Center text fields within form
                            width: '100%',
                        }}
                    >
                        <TextField
                            label="First Name"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Register
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default RegisterForm;