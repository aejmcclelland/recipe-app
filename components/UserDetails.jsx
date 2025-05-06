'use client';
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileDetailsForm from './ProfileDetailsForm';

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
            <Typography variant="body2" sx={{ mt: 1, mb: 1, color: 'text.secondary' }}>
                You can update your name and email below:
            </Typography>
            <Box mt={2} width="100%">
                <ProfileDetailsForm user={user} onDetailsUpdated={() => {}} />
            </Box>
        </Box>
    );
}