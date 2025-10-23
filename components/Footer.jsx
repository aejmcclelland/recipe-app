import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { Box, Typography, Container, IconButton, Link } from '@mui/material';
import Grid from '@mui/material/Grid';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box className="no-print"
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                py: 3,
                borderTop: '1px solid #d32f2f',
                color: '#ffffff',
            }}
        >
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={3}
                    sx={{
                        textAlign: { xs: 'center', sm: 'left' }, // Center on mobile, align left on desktop
                    }}
                >
                    {/* Brand Section */}
                    <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                            <IconButton edge="start" aria-label="restaurant-icon">
                                <RestaurantOutlinedIcon sx={{ fontSize: '2rem', color: '#ffffff' }} />
                            </IconButton>
                            <Typography variant="h6" ml={1}>
                                Rebekah&#39;s Recipes
                            </Typography>
                        </Box>
                        <Typography variant="body2" mt={1}>
                            &copy; {currentYear} Rebekah&#39;s Recipes. All rights reserved.
                        </Typography>
                    </Grid>

                    {/* Legal Section */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" gutterBottom>
                            Legal
                        </Typography>
                        <Box display="flex" flexDirection="column" alignItems={{ xs: 'center', sm: 'flex-start' }} gap={1}>
                            <Link href="/privacy-policy" color="inherit" underline="hover">
                                Privacy Policy
                            </Link>
                            <Link href="/terms-of-service" color="inherit" underline="hover">
                                Terms of Service
                            </Link>
                        </Box>
                    </Grid>

                    {/* Contact Section */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" gutterBottom>
                            Contact Us
                        </Typography>
                        <Box display="flex" flexDirection="column" alignItems={{ xs: 'center', sm: 'flex-start' }} gap={1}>
                            <Link href="mailto:contact@rebekahsrecipes.com" color="inherit" underline="hover">
                                contact@rebekahsrecipes.com
                            </Link>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;