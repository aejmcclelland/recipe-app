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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function RecipeAddForm({ categories }) {
    const [ingredients, setIngredients] = useState([]);
    const ingredientsRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

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
        <Box sx={{ width: 800, maxWidth: '100%', mx: 'auto', p: 3 }}>
            <form action={addRecipe} onSubmit={handleFormSubmit}>
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" align="center">
                            Add a Recipe
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" align="center" >
                            Fill in the details to add your recipe
                        </Typography>
                    </Stack>

                    <Stack spacing={2} >
                        <Typography variant="h6" align="left" sx={{ mb: 0 }}>
                            Recipe Name
                        </Typography>
                        <TextField
                            name="name"
                            placeholder="e.g. Classic Lasagna"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                '& .MuiInputBase-root': {
                                    height: 48,
                                },
                            }}
                        />
                    </Stack>

                    <Stack spacing={2} sx={{ width: '100%' }}>
                        <Button
                            component="label"
                            variant="contained"
                            fullWidth
                            startIcon={<AddIcon />}
                            sx={{
                                backgroundColor: '#d32f2f',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '1rem',
                                height: 40,
                                minHeight: 40,
                                mb: 1,
                                '&:hover': { backgroundColor: '#b71c1c' },
                            }}
                        >
                            Upload Image (optional)
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                name="imageFile"
                                onChange={e => {
                                    setSelectedImage(e.target.files[0]?.name || null);
                                }}
                            />
                        </Button>
                        {selectedImage && (
                            <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                                Selected: {selectedImage}
                            </Typography>
                        )}
                    </Stack>

                    <Stack spacing={2} sx={{ width: '100%', mb: 4 }}>
                        <Typography variant="body2" align="left">
                            Select a Category
                        </Typography>
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
                </Stack>

                <Stack spacing={4} sx={{ mt: 4 }}>
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

                <Stack spacing={1} sx={{ mt: 4 }}>
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

                <Stack spacing={1} sx={{ mt: 4 }}>
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

                <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 4 }}>
                    Add Recipe
                </Button>
            </form>
        </Box>
    );
}