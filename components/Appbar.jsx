'use client';
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Avatar, Menu, MenuItem, AppBar, Box, Toolbar, IconButton, Typography, Tooltip } from '@mui/material';
import { RestaurantOutlined as RestaurantOutlinedIcon, Menu as MenuIcon, AddCircle as AddCircleIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import DrawerComponent from '../components/Drawer';
import { shadowsIntoLight } from '@/app/fonts/fonts';

const drawerWidth = 240;

export default function SearchAppBar({ onFilterChange }) {
    const { data: session } = useSession();
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    {/* Menu Icon for Drawer */}
                    <IconButton size="large" edge="start" color="inherit" aria-label="open drawer" sx={{ mr: 2 }} onClick={handleDrawerToggle}>
                        <MenuIcon />
                    </IconButton>

                    {/* Left section with title */}
                    <Link href="/" passHref>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'center',
                                textAlign: isMobile ? 'center' : 'left',
                                flexGrow: 1,
                            }}
                        >
                            <RestaurantOutlinedIcon sx={{ fontSize: '2rem', mr: 1 }} />
                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem', mr: isMobile ? 0 : 0.5 }}>
                                Rebekah&#39;s
                            </Typography>
                            <Typography variant="h6" sx={{ fontFamily: shadowsIntoLight.style.fontFamily, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                                Recipes
                            </Typography>
                        </Box>
                    </Link>

                    {/* Right-aligned Icons (Add Recipe and Account) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        {/* Plus Icon to Add Recipe, visible only when user is logged in */}
                        {session && (
                            <Tooltip title="Add a Recipe" placement="bottom">
                                <Link href="/recipes/add" passHref>
                                    <IconButton color="inherit" sx={{ mr: 2 }}>
                                        <AddCircleIcon sx={{ fontSize: '2rem' }} />
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        )}

                        {/* Account Icon */}
                        <Tooltip title="Account">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {session?.user?.image ? (
                                    <Avatar src={session.user.image} />
                                ) : (
                                    <AccountCircleIcon fontSize="large" />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Account Menu */}
                    <Menu
                        anchorEl={anchorElUser}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                        sx={{ mt: '45px' }}
                    >
                        {session ? (
                            <MenuItem onClick={() => signOut()}>Logout</MenuItem>
                        ) : (
                            <>
                                {/* Redirect to Sign-In page */}
                                <MenuItem onClick={() => (window.location.href = '/recipes/signin')}>
                                    <Typography textAlign="center">Sign In</Typography>
                                </MenuItem>
                                {/* Redirect to Sign-Up page */}
                                <MenuItem onClick={() => window.location.href = '/recipes/signup'}>
                                    <Typography textAlign="center">Register</Typography>
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Drawer for Mobile Menu */}
            <nav>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    <DrawerComponent handleDrawerToggle={handleDrawerToggle} onFilterChange={onFilterChange} />
                </Drawer>
            </nav>
        </Box>
    );
}