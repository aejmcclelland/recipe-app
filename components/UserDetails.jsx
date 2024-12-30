'use client';
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ProfileImageUpload from './ProfileImageUpload';

export default function UserDetails({ user }) {
    const [userImage, setUserImage] = useState(user.image || '/default-profile.png');

    const handleImageUpdate = (newImageUrl) => {
        setUserImage(newImageUrl);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
                p: 3,
                border: '1px solid #ddd',
                borderRadius: 2,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                maxWidth: 400,
                mx: 'auto',
            }}
        >
            {/* Use ProfileImageUpload */}
            <ProfileImageUpload user={{ ...user, image: userImage }} onImageUpdated={handleImageUpdate} />
            <Typography variant="h5">Welcome, {user.name || 'Guest'}!</Typography>
            <Typography variant="body1">Email: {user.email || 'N/A'}</Typography>
        </Box>
    );
}