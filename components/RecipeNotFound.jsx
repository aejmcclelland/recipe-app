// components/RecipeNotFoundRedirect.jsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RecipeNotFoundRedirect() {
    const router = useRouter();

    useEffect(() => {
        toast.error('Recipe not found');
        const timer = setTimeout(() => {
            router.push('/');
        }, 2000); // Redirect after 2 seconds

        return () => clearTimeout(timer);
    }, [router]);

    return null; // This component doesn’t render anything on the page itself
}