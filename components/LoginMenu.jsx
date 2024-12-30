'use client';

import React, { useState } from 'react';
import { Avatar, Menu, MenuItem, IconButton, Typography, Tooltip } from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginMenu() {
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useRouter();

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const getAvatarSrc = () => {
        if (session?.user?.image && session.user.image !== 'default-profile.png') {
            // Append timestamp to bust cache when the image changes
            return `${session.user.image}?t=${Date.now()}`;
        }
        if (session?.user?.image === 'default-profile.png') {
            return '/images/default-profile.png'; // Default user image from public folder
        }
        return null; // No image, show default Material-UI Avatar icon
    };


    return (
        <>
            <Tooltip title={session ? "Account" : "Sign In"}>
                <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    {getAvatarSrc() ? (
                        <Avatar
                            src={getAvatarSrc()}
                            alt={session?.user?.name || 'Default Avatar'}
                            onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = '/images/default-profile.png'; // Fallback to default image
                            }}
                        />
                    ) : (
                        <AccountCircleIcon fontSize="large" />
                    )}
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                sx={{ mt: '45px' }}
            >
                {session ? (
                    <>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                router.push('/recipes/profile');
                            }}
                        >
                            <Typography textAlign="center">Profile</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                signOut();
                            }}
                        >
                            <Typography textAlign="center">Logout</Typography>
                        </MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                router.push('/recipes/signin');
                            }}
                        >
                            <Typography textAlign="center">Sign In</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                router.push('/recipes/register');
                            }}
                        >
                            <Typography textAlign="center">Register</Typography>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
}