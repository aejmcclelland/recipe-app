// components/RecipeAddForm.jsx
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
import StepsInputRow from './StepsInputRow';
import { validateAndCleanRecipeForm } from '@/utils/recipeFormValidation';
import { toast } from 'react-toastify';


export default function RecipeAddForm({ categories }) {
    const [ingredients, setIngredients] = useState([]);
    const [ingredientErrors, setIngredientErrors] = useState([]);
    const ingredientsRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [steps, setSteps] = useState([]);
    const stepsRef = useRef(null);


    const handleAddIngredient = () => {
        setIngredients((prev) => [
            ...prev,
            { ingredient: '', quantity: '', unit: '', customUnit: '' },
        ]);
        setIngredientErrors((prev) => [...prev, {}]);
    };

    const handleIngredientChange = (index, field, value) => {
        setIngredients((prev) => {
            const next = prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing));
            return next;
        });

        // Clear field-level errors as the user edits
        setIngredientErrors((prev) => {
            const next = [...(prev || [])];
            const rowErr = { ...(next[index] || {}) };

            // Clear the specific field error
            delete rowErr[field];

            // If unit changes away from 'other', also clear customUnit error
            if (field === 'unit' && String(value ?? '') !== 'other') {
                delete rowErr.customUnit;
            }

            next[index] = rowErr;
            return next;
        });
    };

    const handleAddStep = () => {
        setSteps((prev) => [...prev, '']);
    };

    // Change step
    const handleStepChange = (index, value) => {
        setSteps((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    // Remove step
    const handleRemoveStep = (index) => {
        setSteps((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFormSubmit = (e) => {
        const result = validateAndCleanRecipeForm({
            ingredients,
            steps,
            fractionToDecimal,
        });

        if (!result.ok) {
            e.preventDefault();
            // If your validator can return per-row errors later, you can set them here.
            toast.error(result.message);
            return;
        }

        const { cleanedIngredients, cleanedSteps } = result;

        // Clear any previous inline errors if the overall validation passed
        setIngredientErrors([]);

        // Persist cleaned payloads into the hidden inputs for the server action
        if (ingredientsRef.current) {
            ingredientsRef.current.value = JSON.stringify(cleanedIngredients);
        }
        if (stepsRef.current) {
            stepsRef.current.value = JSON.stringify(cleanedSteps);
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
                            placeholder="e.g. Mum's Lasagne"
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

                <Stack spacing={4} sx={{ mt: 4, mb: 4 }}>
                    <Typography variant="h5">Ingredients</Typography>
                    <Stack spacing={2}>
                        {ingredients.map((ingredient, index) => (
                            <IngredientInputRow
                                key={index}
                                index={index}
                                ingredient={ingredient}
                                errors={ingredientErrors?.[index]}
                                handleIngredientChange={handleIngredientChange}
                                handleRemoveIngredient={() => {
                                    setIngredients((prev) => prev.filter((_, i) => i !== index));
                                    setIngredientErrors((prev) => (prev || []).filter((_, i) => i !== index));
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
                    <Typography variant="h5">Steps</Typography>
                    <Stack spacing={2}>
                        {steps.map((step, index) => (
                            <StepsInputRow
                                key={index}
                                index={index}
                                step={step}
                                handleStepChange={handleStepChange}
                                handleRemoveStep={handleRemoveStep}
                            />
                        ))}
                        <Button
                            variant="contained"
                            onClick={handleAddStep}
                            type="button"
                            sx={{ width: { mobile: '100%', tablet: 'auto' } }}
                        >
                            + Add Step
                        </Button>
                        <input type="hidden" name="steps" ref={stepsRef} />
                    </Stack>
                </Stack>

                <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 4 }}>
                    Add Recipe
                </Button>
            </form>
        </Box>
    );
}