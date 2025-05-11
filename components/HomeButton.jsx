// components/HomeButton.jsx
'use client';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import FloatingIconButton from './FloatingIconButton';

const HomeButton = () => {
    const router = useRouter();

    return (
        <FloatingIconButton
            onClick={() => router.push('/')}
            icon={<HomeIcon />}
            tooltip="Back to Home"
        />
    );
};

export default HomeButton;