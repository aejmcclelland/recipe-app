import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Stack } from '@mui/material';

export default function ScrapingSiteLinks() {
	const router = useRouter();

	const sites = [
		{
			name: 'Jamie Oliver',
			url: 'https://www.jamieoliver.com/recipes/',
		},
		{
			name: 'BBC Good Food',
			url: 'https://www.bbcgoodfood.com/recipes',
		},
	];

	return (
		<Box sx={{ marginBottom: 2 }}>
			<Stack direction='row' spacing={1}>
				{sites.map((site) => (
					<Link
						key={site.name}
						href={site.url}
						target='_blank'
						rel='noopener noreferrer'>
						<Button endIcon={<OpenInNewIcon />} variant='outlined'>
							{site.name}
						</Button>
					</Link>
				))}
			</Stack>
		</Box>
	);
}
