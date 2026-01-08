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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { usePathname } from 'next/navigation';
import LoginMenu from '../components/LoginMenu';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { shadowsIntoLight } from '@/app/fonts/fonts';

export default function SearchAppBar() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const pathname = usePathname();
	const isDetailPage =
		pathname.startsWith('/recipes/') && pathname.split('/').length === 3;
	const { data: session } = useSession(); // Access session data

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar className="no-print" position='static'>
				<Toolbar
					sx={{
						display: 'flex',
						alignItems: 'center',
						px: isMobile ? 1 : 2,
						gap: isMobile ? 0.5 : 1,
						minWidth: 0,
					}}>
					<Box
						component={Link}
						href='/'
						sx={{
							display: 'flex',
							alignItems: 'center',
							minWidth: 0,
							justifyContent: 'flex-start',
							overflow: 'hidden',
							textDecoration: 'none',
							color: 'inherit',
						}}>
						<RestaurantOutlinedIcon
							sx={{ fontSize: isMobile ? '1.7rem' : '2rem', mr: isMobile ? 0.5 : 1 }}
						/>
						<Typography
							variant='h6'
							noWrap
							sx={{
								fontSize: isMobile ? '1.1rem' : '1.5rem',
								mr: isMobile ? 0 : 0.5,
							}}>
							Rebekah&#39;s
						</Typography>
						<Typography
							variant='h6'
							noWrap
							sx={{
								fontFamily: shadowsIntoLight.style.fontFamily,
								fontSize: isMobile ? '1.1rem' : '1.5rem',
							}}>
							Recipes
						</Typography>
					</Box>

					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							flexShrink: 0,
							ml: 'auto',
						}}>
						{session && (
							<>
								<Tooltip title='Add a Recipe' placement='bottom'>
									<Link href='/recipes/add' passHref>
										<IconButton color='inherit' sx={{ mr: isMobile ? 0.5 : 2 }}>
											<AddCircleIcon sx={{ fontSize: '2rem' }} />
										</IconButton>
									</Link>
								</Tooltip>
								<Tooltip title='Import from Web' placement='bottom'>
									<Link href='/recipes/copyWeb' passHref>
										<IconButton color='inherit' sx={{ mr: isMobile ? 0.5 : 2 }}>
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
		</Box>
	);
}
