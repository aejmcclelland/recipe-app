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
import { toast } from 'react-toastify';


export default function RecipeAddForm({ categories }) {
    const [ingredients, setIngredients] = useState([]);
    const ingredientsRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [steps, setSteps] = useState([]);
    const stepsRef = useRef(null);


    const handleAddIngredient = () => {
        setIngredients((prev) => [...prev, { ingredient: '', quantity: '', unit: '', customUnit: '' }]);
    };

    const handleIngredientChange = (index, field, value) => {
        setIngredients((prev) => {
            const next = prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing));
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
        // --- Client-side validation to avoid ugly server crashes ---
        // Remove completely empty rows
        const cleaned = ingredients
            .map((row) => {
                const rawName = row?.ingredient?.name ?? row?.ingredient ?? '';
                const ingredientName = String(rawName).trim();

                const rawQty = row?.quantity ?? '';
                const qtyStr = String(rawQty).trim();

                const qty =
                    typeof rawQty === 'string' && rawQty.includes('/')
                        ? fractionToDecimal(rawQty)
                        : rawQty;

                const unitRaw = String(row?.unit ?? '').trim();
                const customUnit = String(row?.customUnit ?? '').trim();
                const unit = unitRaw === 'other' ? customUnit : unitRaw;

                return {
                    ...row,
                    ingredient: ingredientName,
                    quantity: qty,
                    unit,
                    customUnit,
                    _meta: { ingredientName, qtyStr, unitRaw, customUnit },
                };
            })
            .filter((row) => {
                const { ingredientName, qtyStr, unitRaw, customUnit } = row._meta;
                // Consider row empty if all fields are empty
                return ingredientName || qtyStr || unitRaw || customUnit;
            });

        // If they added a row but left the ingredient blank
        const firstMissingName = cleaned.find((row) => {
            const { ingredientName } = row._meta;
            return !ingredientName;
        });
        if (firstMissingName) {
            e?.preventDefault?.();
            toast.error('Please enter an ingredient name (or delete the empty row).');
            return;
        }

        // If quantity is provided, require a unit (or custom unit when Other)
        const firstMissingUnit = cleaned.find((row) => {
            const { qtyStr, unitRaw, customUnit } = row._meta;
            const hasQty = qtyStr.length > 0;
            if (!hasQty) return false;
            if (!unitRaw) return true;
            if (unitRaw === 'other' && !customUnit) return true;
            return false;
        });
        if (firstMissingUnit) {
            e?.preventDefault?.();
            toast.error('If you add a quantity, please choose a unit (or fill in the custom unit).');
            return;
        }

        // If unit is provided, require quantity (keeps the pair consistent)
        const firstMissingQty = cleaned.find((row) => {
            const { qtyStr, unitRaw } = row._meta;
            const hasUnit = unitRaw.length > 0;
            if (!hasUnit) return false;
            return qtyStr.length === 0;
        });
        if (firstMissingQty) {
            e?.preventDefault?.();
            toast.error('If you choose a unit, please enter a quantity.');
            return;
        }

        // Strip _meta before submit
        const processed = cleaned.map(({ _meta, ...row }) => row);

        if (ingredientsRef.current) {
            ingredientsRef.current.value = JSON.stringify(processed);
        }
        if (stepsRef.current) {
            stepsRef.current.value = JSON.stringify(steps);
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
                                handleIngredientChange={handleIngredientChange}
                                handleRemoveIngredient={() => {
                                    setIngredients((prev) => prev.filter((_, i) => i !== index));
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