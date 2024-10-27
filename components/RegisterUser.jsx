'use client';
import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import registerUser from '@/app/actions/registerUser';

const RegisterForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await registerUser(formData);
            toast.success(response.message || "User registered successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            toast.error(error.message || "Error registering user.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper
                sx={{
                    padding: 2,
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Register
                </Typography>
                {error && (
                    <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
                        {error}
                    </Typography>
                )}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <TextField label="First Name" name="firstName" required value={formData.firstName} onChange={handleChange} margin="normal" fullWidth />
                        <TextField label="Last Name" name="lastName" required value={formData.lastName} onChange={handleChange} margin="normal" fullWidth />
                        <TextField label="Email" name="email" type="email" required value={formData.email} onChange={handleChange} margin="normal" fullWidth />
                        <TextField label="Password" name="password" type="password" required value={formData.password} onChange={handleChange} margin="normal" fullWidth />
                        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                            Register
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default RegisterForm;