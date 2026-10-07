import { Box, Typography } from '@mui/material';

const steps = [
	['01', 'Find a recipe online'],
	['02', 'Copy its web address'],
	['03', 'Paste it into your collection'],
];

export default function ImportExplainer() {
	return (
		<Box
			component='section'
			aria-labelledby='import-explainer-title'
			sx={{ backgroundColor: '#f1ece2', px: { xs: 3, sm: 5, lg: 7 }, py: { xs: 8, md: 10 } }}>
			<Box
				sx={{
					maxWidth: 1100,
					mx: 'auto',
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
					gap: { xs: 4, md: 10 },
					alignItems: 'start',
				}}>
				<Box>
					<Typography
						component='p'
						sx={{ color: 'primary.main', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
						From a link to your kitchen
					</Typography>
					<Typography
						id='import-explainer-title'
						component='h2'
						sx={{
							mt: 1.5,
							fontFamily: 'Georgia, "Times New Roman", serif',
							fontSize: { xs: '2rem', md: '2.7rem' },
							fontWeight: 400,
							letterSpacing: '-0.035em',
							lineHeight: 1.15,
						}}>
						Keep the recipes you discover
					</Typography>
					<Typography sx={{ mt: 2, maxWidth: 460, color: '#59605e', lineHeight: 1.75 }}>
						When you find a recipe on a supported website, copy its URL and add it to
						your collection. You can review and save the recipe alongside your own.
					</Typography>
				</Box>
				<Box component='ol' sx={{ listStyle: 'none', p: 0, m: 0 }}>
					{steps.map(([number, label]) => (
						<Box
							key={number}
							component='li'
							sx={{
								display: 'flex',
								gap: 2.5,
								alignItems: 'baseline',
								py: 2.2,
								borderBottom: '1px solid #d9d0c2',
							}}>
							<Typography component='span' sx={{ color: 'primary.main', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em' }}>
								{number}
							</Typography>
							<Typography component='span' sx={{ fontSize: { xs: '1.05rem', md: '1.16rem' }, fontWeight: 600 }}>
								{label}
							</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}
