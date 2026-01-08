'use client';
import { Box, Button, Stack } from '@mui/material';
import Link from 'next/link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const sites = [
	{ name: 'BBC Good Food', url: 'https://www.bbcgoodfood.com/' },
	{ name: 'Jamie Oliver', url: 'https://www.jamieoliver.com/recipes/' },
];

export default function ScrapingSiteLinks() {
	return (
		<Box
			sx={{
				mb: 6,
				width: '100%',
				maxWidth: 500,
				mx: 'auto',
				px: { xs: 2, sm: 0 },
			}}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={{ xs: 2, sm: 3 }}
				sx={{ width: '100%' }}>
				{sites.map((site) => (
					<Box key={site.name} sx={{ width: '100%', flex: 1 }}>
						<Link
							href={site.url}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								textDecoration: 'none',
								width: '100%',
								display: 'block',
							}}>
							<Button
								fullWidth
								endIcon={<OpenInNewIcon />}
								variant="contained"
								color="secondary"
								sx={{
									borderRadius: '12px',
									py: 1.25,
									textTransform: 'none',
								}}>
								{site.name}
							</Button>
						</Link>
					</Box>
				))}
			</Stack>
		</Box>
	);
}
