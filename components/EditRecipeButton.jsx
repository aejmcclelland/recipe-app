'use client';

import FloatingIconButton from './FloatingIconButton';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { useRouter } from 'next/navigation';

const EditRecipeButton = ({ recipeId, appearance = 'default' }) => {
    const router = useRouter();

    return (
        <FloatingIconButton
            onClick={() => router.push(`/recipes/${recipeId}/edit`)}
            icon={<EditNoteOutlinedIcon />}
            tooltip="Edit Recipe"
            appearance={appearance}
            actionKind="secondary"
        />
    );
};

export default EditRecipeButton;
