'use client';

import React, { useState } from 'react';
import { Box, Avatar, Tooltip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import updateProfileImage from '@/app/actions/updateProfileImage';

export default function ProfileImageUpload({ user, onImageUpdated }) {
    const [imagePreview, setImagePreview] = useState(user.image || '../public/images/default-profile.png');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);

            try {
                // Directly call the server action
                const newImageUrl = await updateProfileImage(file);

                if (newImageUrl) {
                    setImagePreview(newImageUrl); // Update the image preview
                    onImageUpdated(newImageUrl); // Notify the parent component
                    toast.success('Profile image updated successfully!');
                } else {
                    throw new Error('Failed to update profile image');
                }
            } catch (error) {
                console.error('Error updating profile image:', error);
                toast.error('Error updating profile image. Please try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-block',
                width: 100,
                height: 100,
            }}
        >
            <Avatar
                src={imagePreview}
                alt={user.name || 'User Avatar'}
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                }}
            />

            <Tooltip title="Change profile picture">
                <IconButton
                    component="label"
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 30,
                        height: 30,
                        backgroundColor: '#d32f2f',
                        color: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                            backgroundColor: '#b71c1c',
                        },
                    }}
                >
                    <AddIcon />
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </IconButton>
            </Tooltip>
        </Box>
    );
}