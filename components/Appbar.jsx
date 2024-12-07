'use client';
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Avatar, Menu, MenuItem, AppBar, Box, Toolbar, IconButton, Typography, Tooltip } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { RestaurantOutlined as RestaurantOutlinedIcon, Menu as MenuIcon, AddCircle as AddCircleIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import DrawerComponent from '../components/Drawer';
import { shadowsIntoLight } from '@/app/fonts/fonts';

const drawerWidth = 240;

export default function SearchAppBar() {
    const { data: session } = useSession(); // Access session and status
    const pathname = usePathname();
    const isDetailPage = pathname.startsWith('/recipes/') && pathname.split('/').length === 3;
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const router = useRouter();

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    // if (status === 'loading') {
    //     // Show a loading state while the session is being fetched
    //     return <p>Loading...</p>;
    // }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    {!isDetailPage && (
                        <IconButton size="large" color="inherit" aria-label="open drawer" onClick={handleDrawerToggle}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Link href="/" passHref>
                        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: isMobile ? 'center' : 'left', flexGrow: 1, justifyContent: 'center' }}>
                            <RestaurantOutlinedIcon sx={{ fontSize: '2rem', mr: 1 }} />
                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem', mr: isMobile ? 0 : 0.5 }}>
                                Rebekah&#39;s
                            </Typography>
                            <Typography variant="h6" sx={{ fontFamily: shadowsIntoLight.style.fontFamily, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                                Recipes
                            </Typography>
                        </Box>
                    </Link>

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        {session ? (
                            <>
                                <Tooltip title="Add a Recipe" placement="bottom">
                                    <Link href="/recipes/add" passHref>
                                        <IconButton color="inherit" sx={{ mr: 2 }}>
                                            <AddCircleIcon sx={{ fontSize: '2rem' }} />
                                        </IconButton>
                                    </Link>
                                </Tooltip>
                                <Tooltip title="Account">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        {session.user?.image ? (
                                            <Avatar src={session.user.image} />
                                        ) : (
                                            <AccountCircleIcon fontSize="large" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                {/* Display "Sign In" and "Register" for unauthenticated users */}
                                <MenuItem onClick={() => router.push('/recipes/signin')}>
                                    <Typography textAlign="center">Sign In</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => router.push('/recipes/register')}>
                                    <Typography textAlign="center">Register</Typography>
                                </MenuItem>
                            </>
                        )}
                    </Box>

                    <Menu
                        anchorEl={anchorElUser}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                        sx={{ mt: '45px' }}
                    >
                        {session && (
                            <>
                                <MenuItem onClick={() => {
                                    handleCloseUserMenu();
                                    router.push('/recipes/profile');
                                }}>
                                    <Typography textAlign="center">Profile</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => {
                                    handleCloseUserMenu();
                                    signOut();
                                }}>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </Toolbar>
            </AppBar>

            <nav>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    <DrawerComponent handleDrawerToggle={handleDrawerToggle} />
                </Drawer>
            </nav>
        </Box>
    );
}