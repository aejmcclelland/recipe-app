// app/recipes/register/page.jsx

import { Box, Typography, Paper, Container } from '@mui/material';

export default function RegisterPage() {
    return (
        <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
            <Paper sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Register
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Registration form coming soon. Please check back later.
                </Typography>
            </Paper>
        </Container>
    );
}