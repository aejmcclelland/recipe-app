// app/recipes/register/page.jsx

'use client';
import { Box, Typography, Paper } from '@mui/material';

export default function RegisterPage() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                    Register
                </Typography>
                <Typography variant="body1" textAlign="center" color="textSecondary">
                    Registration form coming soon. Please check back later.
                </Typography>
            </Paper>
        </Box>
    );
}