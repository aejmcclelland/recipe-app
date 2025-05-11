'use client';

import FloatingIconButton from './FloatingIconButton';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { useRouter } from 'next/navigation';

const EditRecipeButton = ({ recipeId }) => {
    const router = useRouter();

    return (
        <FloatingIconButton
            onClick={() => router.push(`/recipes/${recipeId}/edit`)}
            icon={<EditNoteOutlinedIcon />}
            tooltip="Edit Recipe"
        />
    );
};

export default EditRecipeButton;