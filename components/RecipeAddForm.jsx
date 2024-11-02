'use client';
import { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid'; // For Material UI Grid2 system
import addRecipe from '@/app/actions/addRecipe';
import { fractionToDecimal } from '@/utils/fractionToDecimal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';


const RecipeAddForm = () => {
    const router = useRouter();
    const [ingredients, setIngredients] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { ingredient: '', quantity: '', unit: '' }]);
    };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = ingredients.map((ing, i) =>
            i === index ? { ...ing, [field]: value } : ing
        );
        setIngredients(updatedIngredients);
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(event.target);

        // Process ingredients, converting any fraction quantities to decimals
        const processedIngredients = ingredients.map((ingredient) => {
            const quantity = typeof ingredient.quantity === 'string' && ingredient.quantity.includes('/')
                ? fractionToDecimal(ingredient.quantity)
                : ingredient.quantity;
            return {
                ...ingredient,
                quantity, // Use the converted quantity if it was a fraction
            };
        });

        // Append ingredients as JSON to formData
        formData.append('ingredients', JSON.stringify(processedIngredients));

        // Append imageFile if it exists
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            // Call the server action function directly
            const recipeId = await addRecipe(formData); // Capture the returned recipeId

            if (recipeId) {
                toast.success("Recipe added successfully!");
                // Redirect user to the newly created recipe page
                router.push(`/recipes/${recipeId}`);
            } else {
                throw new Error('Recipe creation failed.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error("Error adding recipe. Please try again.");
        }
    }
    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid container spacing={+3}>
                <Grid item xs={+12}>
                    <TextField
                        label="Recipe Name"
                        name="name"
                        variant="outlined"
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={+12} sm={+6}>
                    <TextField
                        label="Prep Time (minutes)"
                        name="prepTime"
                        type="number"
                        variant="outlined"
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={+12} sm={+6}>
                    <TextField
                        label="Cook Time (minutes)"
                        name="cookTime"
                        type="number"
                        variant="outlined"
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={+12} sm={+6}>
                    <TextField
                        label="Serves"
                        name="serves"
                        type="number"
                        variant="outlined"
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Category"
                        name="category"
                        variant="outlined"
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Method"
                        name="method"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        required
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="body1">Upload an image (optional)</Typography>
                    <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange}
                        style={{ marginTop: '8px' }}
                    />
                </Grid>

                {/* Ingredients Fields */}
                {ingredients.map((ingredient, index) => (
                    <Grid container spacing={2} key={index}>
                        <Grid item xs={4}>
                            <TextField
                                label="Ingredient"
                                value={ingredient.ingredient}
                                onChange={(e) =>
                                    handleIngredientChange(index, 'ingredient', e.target.value)
                                }
                                fullWidth
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Quantity"
                                value={ingredient.quantity}
                                onChange={(e) =>
                                    handleIngredientChange(index, 'quantity', e.target.value)
                                }
                                type="number"
                                slotProps={{
                                    input: { step: "any" } // Updated
                                }}
                                fullWidth
                                variant="outlined"
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Unit"
                                value={ingredient.unit}
                                onChange={(e) =>
                                    handleIngredientChange(index, 'unit', e.target.value)
                                }
                                fullWidth
                                variant="outlined"
                                required
                            />
                        </Grid>
                    </Grid>
                ))}

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddIngredient}
                        fullWidth
                    >
                        Add Ingredient
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="secondary"
                        type="submit"
                        fullWidth
                    >
                        Add Recipe
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};


export default RecipeAddForm;