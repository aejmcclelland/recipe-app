'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { shadowsIntoLight } from '@/app/fonts/fonts';
import { publicTokens } from '@/theme/publicTheme';

export default function PublicBrand() {
	return (
		<Box
			component='span'
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				minWidth: 0,
				color: publicTokens.colors.espresso,
				'& img': {
					width: { xs: 42, sm: 64 },
					height: { xs: 40, sm: 62 },
					objectFit: 'contain',
					flexShrink: 0,
					mr: '2px',
				},
			}}>
			<Image src='/images/branding/logo-face.png' alt='' width={64} height={62} />
			<Typography
				component='span'
				variant='h6'
				noWrap
				sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, mr: { xs: 0, sm: 0.5 } }}>
				Rebekah&#39;s
			</Typography>
			<Typography
				component='span'
				variant='h6'
				noWrap
				sx={{
					fontFamily: shadowsIntoLight.style.fontFamily,
					fontSize: { xs: '1.1rem', sm: '1.5rem' },
				}}>
				Recipes
			</Typography>
		</Box>
	);
}
