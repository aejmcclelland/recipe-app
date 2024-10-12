// components/BackToHomeButton.jsx
'use client';
import Link from 'next/link';
import { Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const BackToHomeButton = () => {
    return (
        <Link href="/" passHref>
            <Button
                variant="contained"
                color="primary"
                startIcon={<HomeIcon />}
                sx={{ marginTop: 2 }}
            >
                Back to Home
            </Button>
        </Link>
    );
};

export default BackToHomeButton;