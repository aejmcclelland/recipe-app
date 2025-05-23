'use client'

import { TextField, IconButton, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid2';
import DeleteIcon from '@mui/icons-material/Delete';

const unitOptions = [
    "g", "kg", "ml", "l", "tsp", "tbsp", "cup",
    "piece", "clove", "fillet", "leaf", "pinch", "can", "slice", "packet"
];

export default function IngredientInputRow({ index, ingredient, handleIngredientChange, handleRemoveIngredient }) {
    return (
        <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={3}>
                <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={ingredient.quantity}
                    onChange={e => handleIngredientChange(index, e.target.name, e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    select
                    label="Unit"
                    name="unit"
                    value={ingredient.unit}
                    onChange={e => handleIngredientChange(index, e.target.name, e.target.value)}
                    fullWidth
                >
                    {unitOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={5}>
                <TextField
                    label="Ingredient"
                    name="ingredient"
                    value={ingredient.ingredient}
                    onChange={e => handleIngredientChange(index, e.target.name, e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={1}>
                <IconButton color="error" onClick={() => handleRemoveIngredient(index)} sx={{ color: '#d32f2f' }}>
                    <DeleteIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}