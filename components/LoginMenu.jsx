// components/LoginMenu.jsx
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
            return '../public/images/default-profile.png';
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
                                e.target.src = '../public/images/default-profile.png';
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
                disableScrollLock
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        elevation: 6,
                        sx: {
                            mt: 1.4,
                            minWidth: 120,
                            //borderRadius: 2,
                            textAlign: 'center',
                            px: 0.5,
                        },
                    },
                }}
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