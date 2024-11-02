import SignInForm from '@/components/SignInForm';
import { Box, Container } from '@mui/material';
import { Suspense } from 'react';

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
                    <Suspense fallback={<div>Loading...</div>}>
                        <SignInForm />
                    </Suspense>
                </Box>
            </Container>
        </section>
    );
};

export default SignInPage;