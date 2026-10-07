'use client';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';

const sites = [
	{ name: 'BBC Good Food', url: 'https://www.bbcgoodfood.com/' },
	{ name: 'BBC Food', url: 'https://www.bbc.co.uk/food' },
	{ name: 'Jamie Oliver', url: 'https://www.jamieoliver.com/recipes/' },
];

export default function ScrapingSiteLinks() {
	return (
		<Stack direction='row' useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
			{sites.map((site) => (
				<Button
					key={site.name}
					component={Link}
					href={site.url}
					target='_blank'
					rel='noopener noreferrer'
					endIcon={<OpenInNewIcon sx={{ fontSize: '1rem' }} />}
					variant='text'
					sx={{ minHeight: 44 }}>
					{site.name}
				</Button>
			))}
		</Stack>
	);
}
