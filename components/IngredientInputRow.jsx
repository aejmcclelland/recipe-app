// components/StepsInputRow.jsx
'use client';

import { Stack, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function IngredientInputRow({
    index,
    ingredient,
    handleIngredientChange,
    handleRemoveIngredient,
}) {
    return (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            <TextField
                label="Quantity"
                value={ingredient.quantity ?? ''}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                sx={{ width: 120, flexShrink: 0 }}
                slotProps={{ inputMode: 'decimal' }}
            />

            <TextField
                label="Unit"
                value={ingredient.unit ?? ''}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                sx={{ width: 140, flexShrink: 0 }}
            />

            <TextField
                label="Ingredient"
                value={ingredient.ingredient?.name ?? ingredient.ingredient ?? ''}
                onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                sx={{ flex: 1, minWidth: 0 }}
                fullWidth
            />

            <IconButton
                aria-label="Remove ingredient"
                onClick={handleRemoveIngredient}
                sx={{ flexShrink: 0}}
               
            >
                <DeleteIcon color="warning" />
            </IconButton>
        </Stack>
    );
}