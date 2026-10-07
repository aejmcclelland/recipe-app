import { Box, Typography } from '@mui/material';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

const benefits = [
	{
		icon: TravelExploreOutlinedIcon,
		title: 'Save from the web',
		description: 'Bring recipes you find online into your own collection.',
	},
	{
		icon: EditNoteOutlinedIcon,
		title: 'Add your own',
		description: 'Keep family favourites and personal recipes close at hand.',
	},
	{
		icon: GroupOutlinedIcon,
		title: 'Share with your people',
		description: 'Share recipes with family and friends.',
	},
];

export default function LandingBenefits() {
	return (
		<Box
			component='section'
			aria-label='Ways to use Rebekah’s Recipes'
			sx={{
				borderTop: '1px solid #e4dccf',
				borderBottom: '1px solid #e4dccf',
			}}>
			<Box
				sx={{
					maxWidth: 1240,
					mx: 'auto',
					px: { xs: 3, sm: 5, lg: 7 },
					py: { xs: 5, md: 6 },
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
					columnGap: { xs: 3, md: 6 },
					rowGap: { xs: 3.5, sm: 0 },
				}}>
				{benefits.map(({ icon: Icon, title, description }) => (
					<Box key={title} component='article' sx={{ display: 'flex', gap: 2 }}>
						<Icon aria-hidden='true' sx={{ flex: '0 0 auto', color: 'primary.main', mt: 0.25 }} />
						<Box>
							<Typography component='h2' sx={{ fontSize: '1rem', fontWeight: 700 }}>
								{title}
							</Typography>
							<Typography sx={{ mt: 0.75, color: '#59605e', lineHeight: 1.65, fontSize: '0.93rem' }}>
								{description}
							</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}
