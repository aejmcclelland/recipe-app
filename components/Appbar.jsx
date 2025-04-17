'use client';
import React from 'react';
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Tooltip,
	useMediaQuery,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { usePathname } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import DrawerComponent from '../components/Drawer';
import LoginMenu from '../components/LoginMenu';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { shadowsIntoLight } from '@/app/fonts/fonts';

export default function SearchAppBar() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
	const pathname = usePathname();
	const isDetailPage =
		pathname.startsWith('/recipes/') && pathname.split('/').length === 3;
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const { data: session } = useSession(); // Access session data

	const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar className="no-print" position='static'>
				<Toolbar>
					{!isDetailPage && (
						<IconButton
							size='large'
							color='inherit'
							aria-label='open drawer'
							onClick={handleDrawerToggle}>
							<MenuIcon />
						</IconButton>
					)}

					<Link href='/' passHref>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								flexGrow: 1,
								justifyContent: 'center',
							}}>
							<RestaurantOutlinedIcon sx={{ fontSize: '2rem', mr: 1 }} />
							<Typography
								variant='h6'
								sx={{
									fontSize: isMobile ? '1.2rem' : '1.5rem',
									mr: isMobile ? 0 : 0.5,
								}}>
								Rebekah&#39;s
							</Typography>
							<Typography
								variant='h6'
								sx={{
									fontFamily: shadowsIntoLight.style.fontFamily,
									fontSize: isMobile ? '1.2rem' : '1.5rem',
								}}>
								Recipes
							</Typography>
						</Box>
					</Link>

					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							ml: 'auto',
						}}>
						{session && (
							<>
								<Tooltip title='Add a Recipe' placement='bottom'>
									<Link href='/recipes/add' passHref>
										<IconButton color='inherit' sx={{ mr: 2 }}>
											<AddCircleIcon sx={{ fontSize: '2rem' }} />
										</IconButton>
									</Link>
								</Tooltip>
								<Tooltip title='Import from Web' placement='bottom'>
									<Link href='/recipes/copyWeb' passHref>
										<IconButton color='inherit' sx={{ mr: 2 }}>
											<LanguageIcon sx={{ fontSize: '2rem' }} />
										</IconButton>
									</Link>
								</Tooltip>
							</>
						)}

						{/* Import and Use LoginMenu */}
						<LoginMenu />
					</Box>
				</Toolbar>
			</AppBar>

			<nav>
				<Drawer
					variant='temporary'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					sx={{
						display: { xs: 'block', sm: 'none' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
					}}>
					<DrawerComponent handleDrawerToggle={handleDrawerToggle} />
				</Drawer>
			</nav>
		</Box>
	);
}
