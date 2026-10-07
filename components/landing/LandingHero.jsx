import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import ImageSlot from './ImageSlot';

const sectionContentSx = {
	width: '100%',
	maxWidth: 1240,
	mx: 'auto',
	px: { xs: 3, sm: 5, lg: 7 },
};

export default function LandingHero() {
	return (
		<Box
			component='section'
			aria-labelledby='landing-title'
			sx={{ ...sectionContentSx, py: { xs: 7, sm: 9, md: 12 } }}>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.88fr) minmax(0, 1.12fr)' },
					alignItems: 'center',
					gap: { xs: 5, md: 8 },
				}}>
				<Box sx={{ maxWidth: 560 }}>
					<Typography
						component='p'
						sx={{
							mb: 2,
							color: 'primary.main',
							fontSize: '0.76rem',
							fontWeight: 700,
							letterSpacing: '0.16em',
							textTransform: 'uppercase',
						}}>
						A home for the recipes you love
					</Typography>
					<Typography
						id='landing-title'
						component='h1'
						sx={{
							fontFamily: 'Georgia, "Times New Roman", serif',
							fontSize: { xs: '2.7rem', sm: '3.5rem', md: '4rem', lg: '4.4rem' },
							fontWeight: 400,
							letterSpacing: '-0.045em',
							lineHeight: 1.04,
							color: '#1a2027',
						}}>
						Keep all the recipes you love in one place
					</Typography>
					<Typography
						component='p'
						sx={{
							mt: 3,
							maxWidth: 490,
							fontSize: { xs: '1.05rem', md: '1.15rem' },
							lineHeight: 1.75,
							color: '#4c514f',
						}}>
						Save recipes from around the web, add your own favourites, organise them
						and share them with family and friends.
					</Typography>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: 2.5,
							mt: 4,
						}}>
						<Button
							component='a'
							href='/recipes/register'
							variant='contained'
							size='large'
							sx={{
								px: 3.5,
								py: 1.6,
								borderRadius: 999,
								backgroundColor: '#1a2027',
								color: '#fff',
								fontWeight: 600,
								boxShadow: 'none',
								'&:hover': { backgroundColor: '#343b40', boxShadow: 'none' },
							}}>
							Sign up for free
						</Button>
						<Link
							href='/recipes/signin'
							style={{ fontWeight: 600, color: '#343b40' }}>
							Sign in
						</Link>
					</Box>
				</Box>
				<ImageSlot
					src='/images/landing/hero-pasta.jpg'
					alt='Pesto pasta with tomatoes and greens on a white plate'
					aspectRatio={{ xs: '4 / 3', md: '4 / 5' }}
					objectPosition={{ xs: '72% center', md: '68% center' }}
					sizes='(max-width: 1023px) calc(100vw - 48px), (max-width: 1351px) 48vw, 620px'
					preload
					testId='landing-hero-image-slot'
				/>
			</Box>
		</Box>
	);
}
