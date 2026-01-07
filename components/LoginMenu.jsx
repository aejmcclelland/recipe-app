// components/LoginMenu.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Menu, MenuItem, IconButton, Typography, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginMenu() {
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useRouter();

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const avatarUrl = useMemo(() => {
        const img = session?.user?.image;

        if (img && typeof img === 'string' && img.trim() && !img.includes('default-profile')) {
            const url = img.trim();
            const sep = url.includes('?') ? '&' : '?';
            return `${url}${sep}v=${encodeURIComponent(url)}`;
        }

        // No custom avatar available
        return null;
    }, [session?.user?.image]);

    const [avatarImgError, setAvatarImgError] = useState(false);

    // If the user changes their avatar URL, allow the image to try loading again
    useEffect(() => {
        setAvatarImgError(false);
    }, [avatarUrl]);

    return (
        <>
            <Tooltip title={session?.user ? 'Account' : 'Sign In'}>
                <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    <Avatar
                        src={avatarUrl && !avatarImgError ? avatarUrl : undefined}
                        alt={session?.user?.name || 'User Avatar'}
                        sx={{ width: 32, height: 32, bgcolor: 'transparent', color: 'inherit' }}
                        slotProps={{
                            image: {
                                referrerPolicy: 'no-referrer',
                            },
                        }}
                        onError={() => setAvatarImgError(true)}
                    >
                        <AccountCircleIcon fontSize='large' />
                    </Avatar>
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
                            onClick={async () => {
                                handleCloseMenu();
                                await signOut({ redirect: false });
                                router.push('/recipes/signin');
                                router.refresh();
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