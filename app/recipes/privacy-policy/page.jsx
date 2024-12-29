// pages/privacy-policy.jsx

import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

const PrivacyPolicy = async () => {
    return (
        <Container maxWidth="md">
            <Box mt={4} mb={4}>
                <Typography variant="h3" gutterBottom>
                    Privacy Policy
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Effective Date: 29-12-2024
                </Typography>
                <Typography variant="body1" gutterBottom>
                    RebekahsRecipes (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application (RebekahsRecipes.com).
                </Typography>
                <Typography variant="h5" gutterBottom>
                    1. Information We Collect
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We may collect and process the following types of information:
                </Typography>
                <Typography variant="h6" gutterBottom>
                    1.1 Information You Provide
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• Personal Details: Such as your name, email address, and profile image when you sign up or log in using email or third-party providers like Google." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Content You Submit: Recipes, comments, or other data you choose to share within the app." />
                    </ListItem>
                </List>
                <Typography variant="h5" gutterBottom>
                    2. How We Use Your Information
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• Provide and improve our application." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Personalize your experience, including displaying saved recipes and bookmarks." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Respond to support requests." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Send notifications related to your account or application updates (if applicable)." />
                    </ListItem>
                </List>
                <Typography variant="h5" gutterBottom>
                    3. Sharing Your Information
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We do not sell or rent your personal data to third parties. We may share your data:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• With service providers: For hosting, analytics, and application maintenance." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• As required by law: To comply with legal obligations or respond to lawful requests." />
                    </ListItem>
                </List>
                <Typography variant="h5" gutterBottom>
                    4. Data Retention
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We retain your personal information only as long as necessary to provide you with our application or as required by law.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    5. Your Rights
                </Typography>
                <Typography variant="body1" gutterBottom>
                    You have the right to:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• Access, update, or delete your personal information." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Opt-out of non-essential data collection or email communications." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Withdraw consent for the processing of your data." />
                    </ListItem>
                </List>
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
                <Typography variant="h5" gutterBottom>
                    6. Data Security
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    7. Changes to This Policy
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the application after any changes constitutes your acceptance of the updated policy.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    8. Contact Us
                </Typography>
                <Typography variant="body1" gutterBottom>
                    If you have any questions about this Privacy Policy or your data, please contact us:
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Email:
                    <a href="mailto:contact@rebekahsrecipes.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                        contact@rebekahsrecipes.com
                    </a>
                </Typography>
            </Box>
        </Container>
    );
};

export default PrivacyPolicy;