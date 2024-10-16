'use client';
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import DrawerComponent from '../components/Drawer';
import Link from 'next/link';
import { useFilter } from '../hooks/useFilter';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle'; // Add icon for "Add Recipe"
import { shadowsIntoLight } from '@/app/fonts/fonts';
const drawerWidth = 240;

export default function SearchAppBar({ onFilterChange }) {
    const { handleFilterChange } = useFilter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{ mr: 2 }}
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Link href="/" passHref>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'center',
                                flexGrow: 1,
                                textAlign: isMobile ? 'center' : 'left',
                            }}
                        >
                            <RestaurantOutlinedIcon sx={{ fontSize: '2rem', mr: 1 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                                    mr: isMobile ? 0 : 0.5,
                                }}
                            >
                                Rebekah&#39;s
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: shadowsIntoLight.style.fontFamily, // Apply Shadows Into Light font
                                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                                }}
                            >
                                Recipes
                            </Typography>
                        </Box>
                    </Link>

                    {/* Plus Icon with Tooltip to add a recipe */}
                    <Box sx={{ ml: 'auto' }}>
                        <Tooltip title="Add a Recipe" placement="bottom">
                            <IconButton color="inherit">
                                <Link href="/recipes/add" passHref>
                                    <AddCircleIcon sx={{ fontSize: '2rem', ml: 2 }} />
                                </Link>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>
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
                    <DrawerComponent
                        handleDrawerToggle={handleDrawerToggle}
                        onFilterChange={handleFilterChange} // Pass the filter handler down
                    />
                </Drawer>
            </nav>
        </Box>
    );
}