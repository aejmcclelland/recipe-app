'use client';

import { Box, Typography } from '@mui/material';

export default function UserDetails({ user }) {
    if (!user) return null; // Handle edge case where user data is missing

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4, // Add some margin below
                p: 3, // Padding for spacing
                border: '1px solid #ddd', // Add subtle border
                borderRadius: 2, // Rounded corners
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
                maxWidth: 400, // Restrict max width
                mx: 'auto', // Center the component horizontally
            }}
        >
            {/* User Image */}
            {user.image && (
                <Box
                    component="img"
                    src={user.image}
                    alt={user.name || 'User Avatar'}
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        mb: 2, // Add spacing below the image
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    }}
                />
            )}
            {/* User Details */}
            <Typography variant="h5" gutterBottom>
                Welcome, {user.name || 'Guest'}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
                Email: {user.email || 'N/A'}
            </Typography>
        </Box>
    );
}