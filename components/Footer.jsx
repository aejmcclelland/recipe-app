import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { Box, Typography, Container, IconButton, Link } from '@mui/material';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                py: 1.1,
                mt: 6,
                borderTop: '1px solid #d32f2f',
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {/* Icon Section */}
                <Box sx={{ mb: { xs: 2, md: 0 } }}>
                    <IconButton edge="start" aria-label="restaurant-icon">
                        <RestaurantOutlinedIcon
                            sx={{ fontSize: '2rem', color: '#ffffff' }}
                        />
                    </IconButton>
                </Box>

                {/* Links Section */}
                <Box sx={{ mb: { xs: 2, md: 0 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <Link href="/recipes" underline="none" color="#ffffff" sx={{ mx: 2 }}>
                        <Typography variant="body1" color="#ffffff">
                            Rebekah's Recipes
                        </Typography>
                    </Link>
                </Box>

                {/* Copyright Section */}
                <Box>
                    <Typography variant="body2" color="text.secondary" align="center">
                        &copy; {currentYear} Rebekah's Recipes. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;