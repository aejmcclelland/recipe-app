// components/RecipeNotFoundRedirect.jsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RecipeNotFoundRedirect() {
    const router = useRouter();

    useEffect(() => {
        toast.error('Recipe not found');
        router.push('/'); // Redirect to home after showing the toast
    }, []);

    return null; // This component doesn’t render anything on the page itself
}