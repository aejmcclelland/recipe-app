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

                <Typography variant="h5" gutterBottom>7. Contact</Typography>
                <Typography variant="body1" gutterBottom>
                    If you have any questions about these Terms of Service, please contact us:
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Email: <a href="mailto:contact@rebekahsrecipes.com" style={{ color: 'inherit', textDecoration: 'none' }}>contact@rebekahsrecipes.com</a>
                </Typography>
            </Box>
        </Container>
    );
}
