import { Box, Button, Typography } from '@mui/material';

export default function LandingFinalCta() {
	return (
		<Box
			component='section'
			aria-labelledby='landing-final-cta-title'
			sx={{ px: { xs: 3, sm: 5, lg: 7 }, py: { xs: 8, md: 10 }, textAlign: 'center' }}>
			<Typography
				id='landing-final-cta-title'
				component='h2'
				sx={{
					fontFamily: 'Georgia, "Times New Roman", serif',
					fontSize: { xs: '2rem', md: '2.8rem' },
					fontWeight: 400,
					letterSpacing: '-0.035em',
				}}>
				Make room for the recipes you love
			</Typography>
			<Typography sx={{ mt: 1.5, color: '#59605e' }}>
				Start your collection today.
			</Typography>
			<Button
				component='a'
				href='/recipes/register'
				variant='contained'
				sx={{
					mt: 3,
					px: 3.5,
					py: 1.5,
					borderRadius: 999,
					backgroundColor: '#1a2027',
					color: '#fff',
					fontWeight: 600,
					boxShadow: 'none',
					'&:hover': { backgroundColor: '#343b40', boxShadow: 'none' },
				}}>
				Sign up for free
			</Button>
		</Box>
	);
}
