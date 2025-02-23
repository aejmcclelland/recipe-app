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
            return `${session.user.image}?t=${Date.now()}`;
        }
        if (session?.user?.image === 'default-profile.png') {
            return '/images/default-profile.png';
        }
        return null;
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
                                e.target.onerror = null;
                                e.target.src = '/images/default-profile.png';
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
                {session
                    ? [
                        <MenuItem
                            key="profile"
                            onClick={() => {
                                handleCloseMenu();
                                router.push('/recipes/profile');
                            }}
                        >
                            <Typography textAlign="center">Profile</Typography>
                        </MenuItem>,
                        <MenuItem
                            key="logout"
                            onClick={() => {
                                handleCloseMenu();
                                signOut();
                            }}
                        >
                            <Typography textAlign="center">Logout</Typography>
                        </MenuItem>,
                    ]
                    : [
                        <MenuItem
                            key="signin"
                            onClick={() => {
                                handleCloseMenu();
                                router.push('/recipes/signin');
                            }}
                        >
                            <Typography textAlign="center">Sign In</Typography>
                        </MenuItem>,
                        <MenuItem
                            key="register"
                            onClick={() => {
                                handleCloseMenu();
                                router.push('/recipes/register');
                            }}
                        >
                            <Typography textAlign="center">Register</Typography>
                        </MenuItem>,
                    ]}
            </Menu>
        </>
    );
}