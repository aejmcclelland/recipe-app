import { Box, Typography } from '@mui/material';
import ImageSlot from './ImageSlot';

export default function ProductShowcase() {
	return (
		<Box
			component='section'
			aria-labelledby='product-showcase-title'
			sx={{ px: { xs: 3, sm: 5, lg: 7 }, py: { xs: 8, md: 12 } }}>
			<Box sx={{ maxWidth: 1240, mx: 'auto', textAlign: 'center' }}>
				<Typography
					id='product-showcase-title'
					component='h2'
					sx={{
						fontFamily: 'Georgia, "Times New Roman", serif',
						fontSize: { xs: '2rem', md: '2.8rem' },
						fontWeight: 400,
						letterSpacing: '-0.035em',
						lineHeight: 1.15,
					}}>
					A collection that feels like yours
				</Typography>
				<Typography sx={{ maxWidth: 600, mx: 'auto', mt: 2, mb: 5, color: '#59605e', lineHeight: 1.7 }}>
					Find your own recipes and the ones shared with you, all gathered in one
					personal space.
				</Typography>
				<Box sx={{ maxWidth: 980, mx: 'auto' }}>
					<ImageSlot
						src='/images/landing/recipe-preview.png'
						alt="Recipe page for 'Marry me' chicken, showing the recipe photograph, ingredients, and method"
						aspectRatio='1.85 / 1'
						objectPosition='center top'
						sizes='(max-width: 1024px) calc(100vw - 48px), 980px'
						testId='landing-product-image-slot'
					/>
				</Box>
			</Box>
		</Box>
	);
}
