// app/recipes/signin/page.jsx
import SignInForm from '@/components/SignInForm';
import { Box, Container } from '@mui/material';

const SignInPage = () => {

    return (
        <section>
            <Container
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: 3,
                }}
            >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <SignInForm />
                </Box>
            </Container>
        </section>
    );
}
export default SignInPage;