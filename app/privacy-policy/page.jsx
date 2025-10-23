// app/terms-of-service/page.jsx
import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

export const metadata = {
    title: "Terms of Service — Rebekah&apos;s Recipes",
    alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfService() {
    return (
        <Container maxWidth="md">
            <Box mt={4} mb={4}>
                <Typography variant="h3" gutterBottom>Terms of Service</Typography>
                <Typography variant="body1" gutterBottom>Effective Date: 29-12-2024</Typography>

                <Typography variant="h5" gutterBottom>1. Introduction</Typography>
                <Typography variant="body1" gutterBottom>
                    Welcome to RebekahsRecipes. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully.
                </Typography>

                <Typography variant="h5" gutterBottom>2. Use of Service</Typography>
                <Typography variant="body1" gutterBottom>
                    You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the service.
                </Typography>

                <Typography variant="h5" gutterBottom>3. User Responsibilities</Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="• Provide accurate and complete information when creating an account." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Maintain the confidentiality of your account credentials." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="• Not engage in any activity that could harm the application or other users." />
                    </ListItem>
                </List>

                <Typography variant="h5" gutterBottom>4. Intellectual Property</Typography>
                <Typography variant="body1" gutterBottom>
                    All content, features, and functionality of the application, including but not limited to text, graphics, logos, and recipes, are the exclusive property of RebekahsRecipes or its licensors and are protected by intellectual property laws.
                </Typography>

                <Typography variant="h5" gutterBottom>5. Limitation of Liability</Typography>
                <Typography variant="body1" gutterBottom>
                    RebekahsRecipes shall not be liable for any damages arising out of or related to your use of the service. The service is provided &quot;as is&quot; without warranties of any kind.
                </Typography>

                <Typography variant="h5" gutterBottom>6. Changes</Typography>
                <Typography variant="body1" gutterBottom>
                    We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date. Your continued use of the service after any changes constitutes acceptance of the new terms.
                </Typography>

                <Typography variant="h5" gutterBottom>7. Google Data</Typography>

                <Box component="section" sx={{ '& p': { mb: 2 } }}>
                    <Typography variant="body1" gutterBottom component="p">
                        This application uses Google OAuth for authentication. By using this service, you agree to the collection and use of information in accordance with Google&apos;s Privacy Policy.
                    </Typography>

                    <Typography variant="body1" gutterBottom component="p">
                        Rebekah&apos;s Recipes uses Google Sign-In to allow users to log in securely. When you choose to sign in with Google, our application accesses limited profile information provided by Google, including:
                    </Typography>

                    <List dense>
                        <ListItem><ListItemText primary="Your name" /></ListItem>
                        <ListItem><ListItemText primary="Your email address" /></ListItem>
                        <ListItem><ListItemText primary="Your Google profile picture" /></ListItem>
                    </List>

                    <Typography variant="body1" gutterBottom component="p">
                        This information is used solely to create and manage your user account, personalise your experience (e.g. display your name or image), and associate your saved recipes and bookmarks with your profile.
                    </Typography>

                    <Typography variant="body1" gutterBottom component="p">
                        We do not access, store, or share any other Google data (such as Gmail, Calendar, or Drive content).  All Google user data is transmitted securely using HTTPS and stored in encrypted databases on MongoDB Atlas.
                        We implement industry-standard security measures to protect user information.
                    </Typography>

                    <Typography variant="body1" gutterBottom component="p">
                        Users can request deletion of their account and associated data at any time by contacting us at
                        <a href="mailto:contact@rebekahsrecipes.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                            contact@rebekahsrecipes.com
                        </a>.
                    </Typography>

                    <Typography variant="body1" gutterBottom component="p">
                        Rebekah&apos;s Recipes complies with the{' '}
                        <a
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'underline' }}
                        >
                            Google API Services User Data Policy
                        </a>, including the Limited Use requirements. We do not transfer Google user data to any third party except as required to operate our service.
                    </Typography>
                </Box>

                <Typography variant="h5" gutterBottom>8. Contact</Typography>
                <Typography variant="body1" gutterBottom>
                    If you have any questions about these Terms of Service, please contact us:
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Email: <a href="mailto:contact@rebekahsrecipes.com" style={{ color: 'inherit', textDecoration: 'none' }}>contact@rebekahsrecipes.com</a>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Last updated: 23 October 2025
                </Typography>
            </Box>
        </Container>
    );
}
