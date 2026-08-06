// components/BookmarkButton.jsx

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

import FloatingIconButton from './FloatingIconButton';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';

import bookmarkRecipe from '@/app/actions/bookmarkRecipe';

const BookmarkButton = ({ recipe, initialBookmarked = false }) => {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    const recipeId = useMemo(() => String(recipe?._id ?? ''), [recipe?._id]);

    // IMPORTANT:
    // Do NOT call a server action on mount for each card.
    // We trust the parent-provided `initialBookmarked` value.
    const parentBookmarked = Boolean(initialBookmarked);
    const [bookmarkState, setBookmarkState] = useState({
        recipeId,
        parentBookmarked,
        localOverride: null,
    });
    const [isSaving, setIsSaving] = useState(false);

    if (
        bookmarkState.recipeId !== recipeId ||
        bookmarkState.parentBookmarked !== parentBookmarked
    ) {
        setBookmarkState({ recipeId, parentBookmarked, localOverride: null });
    }

    const isBookmarked =
        bookmarkState.recipeId === recipeId &&
        bookmarkState.parentBookmarked === parentBookmarked &&
        bookmarkState.localOverride !== null
            ? bookmarkState.localOverride
            : parentBookmarked;

    const setLocalBookmarked = (value) => {
        setBookmarkState({ recipeId, parentBookmarked, localOverride: value });
    };

    const handleClick = async () => {
        if (status === 'loading') return; // session still loading

        if (!userId) {
            toast.error('Please log in to bookmark recipes!');
            return;
        }

        if (!recipeId) {
            toast.error('Missing recipe id. Please refresh and try again.');
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        // Optimistic UI update
        const nextLocal = !isBookmarked;
        setLocalBookmarked(nextLocal);

        try {
            const result = await bookmarkRecipe(recipeId);
            if (!result?.success) {
                // rollback
                setLocalBookmarked(!nextLocal);
                toast.error('Unexpected error occurred. Please try again.');
                return;
            }

            // Trust server truth (in case it differs)
            setLocalBookmarked(Boolean(result.isBookmarked));
            const action = result.isBookmarked ? 'added to' : 'removed from';
            toast.success(`Recipe "${recipe?.name ?? 'Recipe'}" ${action} your bookmarks.`);
        } catch (error) {
            // rollback
            setLocalBookmarked(!nextLocal);
            console.error('Error toggling bookmark:', error);
            toast.error('Failed to toggle bookmark. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FloatingIconButton
            onClick={handleClick}
            disabled={isSaving}
            icon={isBookmarked ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
            tooltip={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            color={isBookmarked ? 'green' : '#d32f2f'}
        />
    );
};

export default BookmarkButton;