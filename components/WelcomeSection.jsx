import { Box } from '@mui/material';
import LandingHero from '@/components/landing/LandingHero';
import LandingBenefits from '@/components/landing/LandingBenefits';
import ProductShowcase from '@/components/landing/ProductShowcase';
import ImportExplainer from '@/components/landing/ImportExplainer';
import LandingFinalCta from '@/components/landing/LandingFinalCta';

export default function WelcomeSection() {
	return (
		<Box
			component='main'
			data-public-landing-root
			data-testid='welcome-section'
			sx={{
				position: 'relative',
				width: '100vw',
				ml: 'calc(50% - 50vw)',
				mt: -3,
				mb: -3,
				backgroundColor: '#f8f5ee',
				color: '#1a2027',
				overflow: 'hidden',
				'& a:focus-visible, & button:focus-visible': {
					outline: '3px solid #d32f2f',
					outlineOffset: 3,
				},
			}}>
			<LandingHero />
			<LandingBenefits />
			<ProductShowcase />
			<ImportExplainer />
			<LandingFinalCta />
		</Box>
	);
}
