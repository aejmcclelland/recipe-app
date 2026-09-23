// app/recipes/register/page.jsx
import RegisterForm from '@/components/RegisterUser';
import BackToHomeButton from '@/components/BackToHomeButton';
import { Box, Container } from '@mui/material';

const RegisterPage = () => {
    return (
        <Container
            component="section"
            maxWidth={false}
            disableGutters
            sx={{ maxWidth: 560, py: { xs: 0, sm: 2 } }}
        >
            <RegisterForm />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <BackToHomeButton />
            </Box>
        </Container>
    );
};

export default RegisterPage;
