import { Box } from '@mui/material';
import Image from 'next/image';

export default function ImageSlot({
	src,
	alt,
	aspectRatio,
	objectPosition = 'center',
	sizes,
	preload = false,
	testId,
}) {
	return (
		<Box
			component='figure'
			data-testid={testId}
			sx={{
				position: 'relative',
				aspectRatio,
				width: '100%',
				m: 0,
				overflow: 'hidden',
				border: '1px solid #e4dccf',
				borderRadius: { xs: 4, md: 6 },
				backgroundColor: '#eee7db',
				'& img': {
					objectFit: 'cover',
					objectPosition,
				},
			}}>
			<Image src={src} alt={alt} fill sizes={sizes} preload={preload} />
		</Box>
	);
}
