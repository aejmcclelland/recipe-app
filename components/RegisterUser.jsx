'use client';
import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import registerUser from '@/app/actions/registerUser';
import zxcvbn from 'zxcvbn';

const RegisterForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        if (name === 'password') {
            const result = zxcvbn(value);
            setPasswordStrength(result);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setPasswordError("Passwords do not match. Try again, please");
            return;
        } else {
            setPasswordError('');
        }

        setIsSubmitting(true);
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
            router.push('/recipes/signin?registered=1');
        } catch (error) {
            toast.error(error.message || "Error registering user.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
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
                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            margin="normal"
                            fullWidth
                        />
                        {passwordError && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {passwordError}
                            </Typography>
                        )}
                        {passwordStrength && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                                <Box
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: ['#ccc', '#f44336', '#ff9800', '#ffeb3b', '#4caf50'][passwordStrength.score],
                                        width: `${(passwordStrength.score + 1) * 20}%`,
                                        transition: 'width 0.3s ease-in-out',
                                    }}
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                    {passwordStrength.feedback.suggestions[0] || 'Password strength looks good.'}
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            sx={{ mt: 2 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default RegisterForm;