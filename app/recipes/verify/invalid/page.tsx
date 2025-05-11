'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function VerifyInvalidPage() {
  return (
    <Box sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h4" color="error" gutterBottom>
        Verification Failed
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        The verification link is invalid or has expired. Please register again or request a new verification email.
      </Typography>
      <Link href="/recipes/register" passHref>
        <Button variant="contained" color="primary">
          Back to Register
        </Button>
      </Link>
    </Box>
  );
}
