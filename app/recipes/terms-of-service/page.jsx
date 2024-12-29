// pages/privacy-policy.jsx

import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

const TermsOfService = async () => {
    return (
        <Container maxWidth="md">
            <Box mt={4} mb={4}>
                <Typography variant="h3" gutterBottom>
                    Terms of Service
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Effective Date: 29-12-2024
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Welcome to Rebekah’s Recipes! By accessing or using our website (www.rebekahsrecipes.com), you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully before using the service.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    1. Acceptance of Terms
                </Typography>
                <Typography variant="body1" gutterBottom>
                    By accessing or using the website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must not use the website.
                </Typography>
                <Typography variant="h6" gutterBottom>
                    2. Changes to Terms
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We reserve the right to modify these Terms of Service at any time without prior notice. Changes will be effective immediately upon posting on this page. Continued use of the website constitutes acceptance of the modified terms.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    3. Use of the Website
                </Typography>
                <Typography variant="body1" gutterBottom>
                    You agree to use the website solely for lawful purposes. You are prohibited from:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• Using the website in a way that violates any laws or regulations." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Attempting to gain unauthorized access to the website or its related systems." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Engaging in any activity that disrupts or interferes with the website’s functionality." />
                    </ListItem>
                </List>
                <Typography variant="h5" gutterBottom>
                    4. Intellectual Property
                </Typography>
                <Typography variant="body1" gutterBottom>
                    All content on this website, including but not limited to text, images, logos, and recipes, is the property of Rebekah’s Recipes or its content creators. Unauthorized reproduction, distribution, or use is strictly prohibited.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    5. User Content
                </Typography>
                <Typography variant="body1" gutterBottom>
                    By submitting any content (e.g., recipes, comments) to the website, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, and modify the content. You represent that you have the rights to share such content and that it does not infringe on any third-party rights.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    6. Limitation of Liability
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Rebekah’s Recipes are provided on an “as is” and “as available” basis. We make no warranties or representations regarding the accuracy, reliability, or availability of the website or its content. To the fullest extent permitted by law, we disclaim all liability for any loss or damage arising from your use of the website.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    7. Links to Third-Party Sites
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Our website may contain links to third-party websites. We do not endorse or assume responsibility for the content or practices of these websites. Accessing third-party sites is at your own risk.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    8. Termination
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We reserve the right to terminate or restrict your access to the website at any time without notice if we believe you have violated these Terms of Service.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    9. Governing Law
                </Typography>
                <Typography variant="body1" gutterBottom>
                    These terms are governed by and construed in accordance with the laws of United Kingdom. Any disputes will be subject to the exclusive jurisdiction of the courts of United Kingdom.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    10. Contact Information
                </Typography>
                <Typography variant="body1" gutterBottom>
                    If you have questions about these Terms of Service, please contact us at:
                </Typography>
                <Typography variant="body1" gutterBottom component="div">
                    Email:
                    <Typography
                        variant="body1"
                        component="span"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        <a href="mailto:contact@rebekahsrecipes.com">contact@rebekahsrecipes.com</a>
                    </Typography>
                </Typography>

                <Typography variant="body1" gutterBottom component="div">
                    Website:
                    <Typography
                        variant="body1"
                        component="span"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        <a href="rebekahsrecipes.com">rebekahsrecipes.com</a>
                    </Typography>
                </Typography>
                <Typography variant="h5" gutterBottom>
                    11. Entire Agreement
                </Typography>
                <Typography variant="body1" gutterBottom>
                    These Terms of Service constitute the entire agreement between you and Rebekah’s Recipes regarding the use of the website and supersede any prior agreements.
                </Typography>
            </Box>
        </Container>
    );
};

export default TermsOfService;