// pages/terms-of-service.jsx

import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

export default function TermsOfService() {
    return (
        <Container maxWidth="md">
            <Box mt={4} mb={4}>
                <Typography variant="h3" gutterBottom>
                    Terms of Service
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Effective Date: December 29, 2024
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Welcome to Rebekah’s Recipes! By accessing or using our website (www.rebekahsrecipes.com), you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully before using our service.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    1. Acceptance of Terms
                </Typography>
                <Typography variant="body1" gutterBottom>
                    By accessing or using the website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the website.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    2. Changes to Terms
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We reserve the right to modify these Terms of Service at any time without prior notice. Changes will become effective immediately upon posting on this page. Your continued use of the website after such changes constitutes acceptance of the updated terms.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    3. Use of the Website
                </Typography>
                <Typography variant="body1" gutterBottom>
                    You agree to use the website solely for lawful purposes and in accordance with these Terms. You are prohibited from:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• Using the website in any way that violates applicable laws or regulations." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Attempting to gain unauthorized access to the website, user accounts, or related systems." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Engaging in any activity that disrupts, damages, or interferes with the website’s functionality or security." />
                    </ListItem>
                </List>
                <Typography variant="h5" gutterBottom>
                    4. Intellectual Property
                </Typography>
                <Typography variant="body1" gutterBottom>
                    All content on this website, including but not limited to text, images, logos, and recipes, is the property of Rebekah’s Recipes or its content contributors. Unauthorized reproduction, distribution, or use of the content is strictly prohibited without prior written permission.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    5. User Content
                </Typography>
                <Typography variant="body1" gutterBottom>
                    By submitting content (such as recipes or comments) to the website, you grant Rebekah’s Recipes a non-exclusive, royalty-free, perpetual, irrevocable, and worldwide license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content. You represent and warrant that you have all necessary rights to grant this license and that your content does not violate any third-party rights or laws.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    6. Limitation of Liability
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Rebekah’s Recipes is provided on an “as is” and “as available” basis. We make no warranties or representations regarding the accuracy, reliability, or availability of the website or its content. To the fullest extent permitted by law, Rebekah’s Recipes disclaims all liability for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the website.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    7. Links to Third-Party Sites
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Our website may contain links to third-party websites for your convenience. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party sites. Accessing such sites is at your own risk.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    8. Termination
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We reserve the right to suspend or terminate your access to the website at any time, without notice, if we believe you have violated these Terms of Service or for any other reason at our sole discretion.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    9. Governing Law
                </Typography>
                <Typography variant="body1" gutterBottom>
                    These Terms of Service shall be governed by and construed in accordance with the laws of the United Kingdom. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of the United Kingdom.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    10. Contact Information
                </Typography>
                <Typography variant="body1" gutterBottom>
                    If you have any questions about these Terms of Service, please contact us at:
                </Typography>
                <Typography variant="body1" gutterBottom component="div">
                    Email:{' '}
                    <Typography
                        variant="body1"
                        component="span"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        <a href="mailto:contact@rebekahsrecipes.com">contact@rebekahsrecipes.com</a>
                    </Typography>
                </Typography>

                <Typography variant="body1" gutterBottom component="div">
                    Website:{' '}
                    <Typography
                        variant="body1"
                        component="span"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        <a href="https://rebekahsrecipes.com" target="_blank" rel="noopener noreferrer">rebekahsrecipes.com</a>
                    </Typography>
                </Typography>
                <Typography variant="h5" gutterBottom>
                    11. Entire Agreement
                </Typography>
                <Typography variant="body1" gutterBottom>
                    These Terms of Service constitute the entire agreement between you and Rebekah’s Recipes regarding your use of the website and supersede all prior agreements or understandings.
                </Typography>
            </Box>
        </Container>
    );
};
