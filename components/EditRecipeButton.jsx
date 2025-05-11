'use client';

import { IconButton, Tooltip } from '@mui/material';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import Link from 'next/link';

const EditRecipeButton = ({ recipeId }) => (
    <Tooltip title="Edit Recipe">
        <IconButton
            component={Link}
            href={`/recipes/${recipeId}/edit`}
            sx={{
                color: 'gray',
                border: '1px solid',
                borderColor: 'gray',
                borderRadius: '50%',
            }}
        >
            <EditNoteOutlinedIcon />
        </IconButton>
    </Tooltip>
);

export default EditRecipeButton;