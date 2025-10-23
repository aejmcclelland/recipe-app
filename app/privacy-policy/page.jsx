// app/privacy-policy/page.jsx
import { Container, Typography, Box, List, ListItem, ListItemText, Link as MuiLink } from '@mui/material';

export const metadata = {
  title: "Privacy Policy — Rebekah&apos;s Recipes",
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Typography variant="h3" gutterBottom>Privacy Policy</Typography>
        <Typography variant="body1" gutterBottom component="p">
          Effective Date: 23-10-2025
        </Typography>

        <Typography variant="h5" gutterBottom>1. Overview</Typography>
        <Typography variant="body1" gutterBottom component="p">
          Rebekah&apos;s Recipes (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a recipe-saving and sharing application. This Privacy Policy explains what information we collect, how we use it, how it is stored and protected, and your choices. By using our service, you agree to the practices described here.
        </Typography>

        <Typography variant="h5" gutterBottom>2. Information We Collect</Typography>
        <Typography variant="body1" gutterBottom component="p">
          We collect the following information to operate the service:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Account Information"
              secondary="If you sign in with Google, we receive your name, primary email address, and profile image from Google. If you register with email/password, we collect your name and email."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="User Content"
              secondary="Recipes you create or save, including ingredients, steps, images you upload, categories, times, and bookmarks."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Device &amp; Usage Data"
              secondary="Basic technical information (e.g., IP address, browser type) captured by our hosting and security providers for reliability and abuse prevention."
            />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>3. How We Use Information</Typography>
        <List dense>
          <ListItem><ListItemText primary="Authenticate you and maintain your session." /></ListItem>
          <ListItem><ListItemText primary="Create and manage your account and profile." /></ListItem>
          <ListItem><ListItemText primary="Save your recipes, images, and bookmarks and show them to you across devices." /></ListItem>
          <ListItem><ListItemText primary="Send transactional emails (e.g., verification, account notices)." /></ListItem>
          <ListItem><ListItemText primary="Protect our service against fraud, abuse, and technical issues." /></ListItem>
        </List>

        <Typography variant="h5" gutterBottom>4. Data Storage &amp; Security</Typography>
        <Typography variant="body1" gutterBottom component="p">
          Data is transmitted over HTTPS/TLS and stored in databases hosted on MongoDB Atlas. Images you upload are stored with Cloudinary. Email delivery is handled by SendGrid. We apply industry-standard technical and organizational measures and limit staff access to what is necessary to operate the service.
        </Typography>

        <Typography variant="h5" gutterBottom>5. Sharing of Information</Typography>
        <Typography variant="body1" gutterBottom component="p">
          We do not sell your personal information. We share data only with service providers that help us operate the app (e.g., hosting, storage, email) under appropriate agreements, or where required by law.
        </Typography>

        <Typography variant="h5" gutterBottom>6. Data Retention</Typography>
        <Typography variant="body1" gutterBottom component="p">
          We retain your information for as long as your account is active or as needed to provide the service. If you request deletion, we will delete or anonymize your personal data unless we are required to keep it for legal, security, or operational reasons.
        </Typography>

        <Typography variant="h5" gutterBottom>7. Your Choices &amp; Rights</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Access &amp; Update" secondary="You can view and update certain account details in the app." />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Deletion"
              secondary={
                <>
                  You may request account deletion by emailing{' '}
                  <MuiLink href="mailto:contact@rebekahsrecipes.com">contact@rebekahsrecipes.com</MuiLink>. Deleting your account will remove your profile and associated content, subject to lawful retention requirements.
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Email Preferences" secondary="We send only essential transactional emails (e.g., verification). We do not send marketing emails without consent." />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>8. Google User Data</Typography>
        <Typography variant="body1" gutterBottom component="p">
          When you sign in with Google, we access limited Google profile data: your name, primary email address, and profile image. We use this data only to authenticate you, create/maintain your account, display your profile within the app, and associate your bookmarks and saved recipes with your account.
        </Typography>
        <Typography variant="body1" gutterBottom component="p">
          We do not access any Gmail, Drive, Calendar, Contacts, or other Google data. We do not transfer Google user data to third parties except as necessary to operate the service (e.g., secure hosting) or as required by law. We comply with the{' '}
          <MuiLink
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </MuiLink>, including the Limited Use requirements.
        </Typography>

        <Typography variant="h5" gutterBottom>9. Cookies &amp; Similar Technologies</Typography>
        <Typography variant="body1" gutterBottom component="p">
          We use essential cookies and similar technologies required to provide sign-in and core functionality. We do not currently use analytics or advertising cookies.
        </Typography>

        <Typography variant="h5" gutterBottom>10. Children&apos;s Privacy</Typography>
        <Typography variant="body1" gutterBottom component="p">
          Our service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.
        </Typography>

        <Typography variant="h5" gutterBottom>11. International Transfers</Typography>
        <Typography variant="body1" gutterBottom component="p">
          Our service providers may process data in multiple countries (for example, the UK, EU, or US). We rely on appropriate safeguards, such as contractual protections, for any cross-border data transfers.
        </Typography>

        <Typography variant="h5" gutterBottom>12. Changes to This Policy</Typography>
        <Typography variant="body1" gutterBottom component="p">
          We may update this Privacy Policy from time to time. We will post the updated policy on this page and revise the effective date above. Material changes will be communicated when required by law.
        </Typography>

        <Typography variant="h5" gutterBottom>13. Contact Us</Typography>
        <Typography variant="body1" gutterBottom component="p">
          Email: <MuiLink href="mailto:contact@rebekahsrecipes.com">contact@rebekahsrecipes.com</MuiLink>
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Last updated: 23 October 2025
        </Typography>
      </Box>
    </Container>
  );
}
