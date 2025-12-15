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

    const avatarSrc = React.useMemo(() => {
        const img = session?.user?.image;

        // If we have a real URL (Cloudinary / Google / etc.), use it.
        if (img && typeof img === 'string' && img.trim() && !img.includes('default-profile')) {
            // Cache-bust only when the image value changes (not every render)
            const url = img.trim();
            const sep = url.includes('?') ? '&' : '?';
            return `${url}${sep}v=${encodeURIComponent(url)}`;
        }

        // Next.js public assets must be referenced from the web root
        return '/images/default-profile.png';
    }, [session?.user?.image]);

    return (
        <>
            <Tooltip title={session?.user ? 'Account' : 'Sign In'}>
                <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    <Avatar
                        src={avatarSrc}
                        alt={session?.user?.name || 'User Avatar'}
                        imgProps={{
                            referrerPolicy: 'no-referrer',
                        }}
                        onError={(e) => {
                            // Fallback if the remote image fails to load
                            const img = e.currentTarget.querySelector('img');
                            if (img) img.src = '/images/default-profile.png';
                        }}
                    />
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