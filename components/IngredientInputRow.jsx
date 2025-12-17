'use client';

import { Box, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function IngredientInputRow({
    index,
    ingredient,
    handleIngredientChange,
    handleRemoveIngredient,
}) {
    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {/* Row 1: Ingredient (full width) */}
            <TextField
                label="Ingredient"
                value={ingredient.ingredient?.name ?? ingredient.ingredient ?? ''}
                onChange={(e) =>
                    handleIngredientChange(index, 'ingredient', e.target.value)
                }
                fullWidth
                sx={{ minWidth: 0 }}
            />

            {/* Row 2: Quantity + Unit + Delete */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                }}
            >
                <TextField
                    label="Quantity"
                    value={ingredient.quantity ?? ''}
                    onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                    }
                    sx={{ flex: 1, minWidth: 0 }}
                    slotProps={{ input: { inputMode: 'decimal' } }}
                />

                <TextField
                    label="Unit"
                    value={ingredient.unit ?? ''}
                    onChange={(e) =>
                        handleIngredientChange(index, 'unit', e.target.value)
                    }
                    sx={{ flex: 1, minWidth: 0 }}
                />

                <IconButton
                    aria-label="Remove ingredient"
                    onClick={handleRemoveIngredient}
                    sx={{ flexShrink: 0 }}
                >
                    <DeleteIcon color="warning" />
                </IconButton>
            </Box>
        </Box>
    );
}