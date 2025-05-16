'use client';
import { useState, useRef } from 'react';
import addRecipe from '@/app/actions/addRecipe';
import { fractionToDecimal } from '@/utils/fractionToDecimal';
import IngredientInputRow from './IngredientInputRow';
import {
    TextField,
    Button,
    Typography,
    Box,
    Stack,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function RecipeAddForm({ categories }) {
    const [ingredients, setIngredients] = useState([]);
    const ingredientsRef = useRef(null);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { ingredient: '', quantity: '', unit: '' }]);
    };

    const handleIngredientChange = (index, field, value) => {
        const updated = ingredients.map((ing, i) =>
            i === index ? { ...ing, [field]: value } : ing
        );
        setIngredients(updated);
    };

    const handleFormSubmit = () => {
        const processed = ingredients.map((ingredient) => {
            const quantity = typeof ingredient.quantity === 'string' && ingredient.quantity.includes('/')
                ? fractionToDecimal(ingredient.quantity)
                : ingredient.quantity;
            return { ...ingredient, quantity };
        });

        if (ingredientsRef.current) {
            ingredientsRef.current.value = JSON.stringify(processed);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <form action={addRecipe} onSubmit={handleFormSubmit}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" >
                            Add a Recipe
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" >
                            Fill in the details to add your recipe
                        </Typography>
                    </Stack>

                    <Box>
                        <Typography variant="h5" align="left" sx={{ pl: 1 }}>
                            Recipe Name
                        </Typography>
                        <TextField
                            name="name"
                            placeholder="e.g. Classic Lasagna"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{
                                mt: 1,
                                mb: 2,
                                // Ensure full width inside Box
                                width: '100%',
                                maxWidth: '100%',
                            }}
                        />
                    </Box>

                    <Stack spacing={3} direction={{ mobile: 'column', tablet: 'row' }} alignItems="center">
                        <Stack spacing={1} alignItems="center">
                            <Typography variant="body2">Upload Image (optional)</Typography>
                            <IconButton
                                component="label"
                                sx={{
                                    backgroundColor: '#d32f2f',
                                    color: 'white',
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    '&:hover': { backgroundColor: '#b71c1c' },
                                }}
                            >
                                <AddIcon fontSize="large" />
                                <input hidden accept="image/*" type="file" name="imageFile" />
                            </IconButton>
                        </Stack>

                        <FormControl fullWidth required>
                            <InputLabel id="category-label">Category</InputLabel>
                            <Select
                                labelId="category-label"
                                label="Category"
                                name="category"
                                defaultValue=""
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category._id} value={category.name}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography variant="h5">Times & Serves</Typography>
                        <Stack spacing={2} direction={{ mobile: 'column', tablet: 'row' }}>
                            <TextField
                                label="Prep Time (mins)"
                                name="prepTime"
                                type="number"
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Cook Time (mins)"
                                name="cookTime"
                                type="number"
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Serves"
                                name="serves"
                                type="number"
                                variant="outlined"
                                fullWidth
                                required
                            />
                        </Stack>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography variant="h5">Ingredients</Typography>
                        <Stack spacing={2}>
                            {ingredients.map((ingredient, index) => (
                                <IngredientInputRow
                                    key={index}
                                    index={index}
                                    ingredient={ingredient}
                                    handleIngredientChange={(index, event) => {
                                        const { name, value } = event.target;
                                        handleIngredientChange(index, name, value);
                                    }}
                                    handleRemoveIngredient={() => {
                                        const updated = ingredients.filter((_, i) => i !== index);
                                        setIngredients(updated);
                                    }}
                                />
                            ))}
                            <Button
                                variant="contained"
                                onClick={handleAddIngredient}
                                type="button"
                                sx={{ width: { mobile: '100%', tablet: 'auto' } }}
                            >
                                + Add Ingredient
                            </Button>

                            <input type="hidden" name="ingredients" ref={ingredientsRef} />
                        </Stack>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography variant="h5">Method</Typography>
                        <TextField
                            label="Method"
                            name="method"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={5}
                            required
                        />
                    </Stack>

                    <Button type="submit" variant="contained" size="large" fullWidth>
                        Add Recipe
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}