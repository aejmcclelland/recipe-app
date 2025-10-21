import SignInForm from '@/components/SignInForm';
import { Box, Container, Stack, Typography, Avatar } from '@mui/material';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { Suspense } from 'react';

const SignInPage = () => {
  return (
    <section>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Stack spacing={3} sx={{ width: '100%', textAlign: 'center' }}>
            {/* Brand header */}
            <Stack spacing={1} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 72,
                  height: 72,
                }}
                aria-hidden
              >
                <RestaurantOutlinedIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" component="h1">
                Rebekah’s Recipes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue
              </Typography>
            </Stack>

            {/* Sign-in form */}
            <Suspense fallback={<div>Loading…</div>}>
              <SignInForm />
            </Suspense>
          </Stack>
        </Box>
      </Container>
    </section>
  );
};

export default SignInPage;