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
				mb: 3,
				width: '100%',
				maxWidth: { mobile: '100%', laptop: 500 },
				mx: 'auto',
			}}>
			<Stack
				direction={{ mobile: 'column', laptop: 'row' }}
				spacing={2}
				sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
				{sites.map((site) => (
					<Box key={site.name} sx={{ width: '100%' }}>
						<Link
							href={site.url}
							target='_blank'
							rel='noopener noreferrer'
							style={{
								textDecoration: 'none',
								width: '100%',
								display: 'block',
							}}>
							<Button
								endIcon={<OpenInNewIcon />}
								variant='contained'
								fullWidth
								sx={{
									borderRadius: '12px',
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
