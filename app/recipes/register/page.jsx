import RegisterForm from '@/components/RegisterUser';
import BackToHomeButton from '@/components/BackToHomeButtonTemp';
import { Box, Container, Typography, Paper } from '@mui/material';

const RegisterPage = () => {
    return (
        <section>
            <Container
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: 2,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 1,
                        width: '100%',
                        maxWidth: 400, // Ensure max width for centering
                        borderRadius: 2,
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // Center items inside Paper
                        textAlign: 'center', // Align text inside
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 1, // Reduced bottom margin
                            fontWeight: 600,
                            color: 'primary.main',
                            textTransform: 'uppercase',
                        }}
                    >
                        Register
                    </Typography>

                    {/* Ensure RegisterForm is centered */}
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 1 }}> {/* Reduced vertical margin */}
                        <RegisterForm />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}> {/* Reduced top margin */}
                        <BackToHomeButton />
                    </Box>
                </Paper>
            </Container>
        </section>
    );
};

export default RegisterPage;