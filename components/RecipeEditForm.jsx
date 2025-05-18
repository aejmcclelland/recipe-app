'use client';
import { Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';
import updateRecipe from '@/app/actions/editRecipe';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';



const RecipeEditForm = ({ recipe, categories = [] }) => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(recipe.category);
    const [imageFile, setImageFile] = useState(null);
    const [deleteImage, setDeleteImage] = useState(false);
    const [prepTime, setPrepTime] = useState(recipe.prepTime || ''); // Track prepTime
    const [cookTime, setCookTime] = useState(recipe.cookTime || ''); // Track cookTime
    const [serves, setServes] = useState(recipe.serves || ''); // Track serves
    const [ingredients, setIngredients] = useState(recipe.ingredients || []); // Initialize with recipe ingredients
    const [steps, setSteps] = useState(recipe.steps || ''); // Track steps

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleImageChange = (event) => {
        setImageFile(event.target.files[0]);
    };

    const handleDeleteImageChange = (event) => {
        setDeleteImage(event.target.checked);
    };
    // const handleStepsdChange = (event) => {
    //     setSteps(event.target.value);
    // };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = ingredients.map((ingredient, i) =>
            i === index ? { ...ingredient, [field]: value } : ingredient
        );
        setIngredients(updatedIngredients);
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { ingredient: '', quantity: '', unit: '' }]);
    };

    const notifySuccess = () => toast.success("Recipe updated successfully!");
    const notifyError = () => toast.error("Error updating recipe!");


    const updateRecipeById = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);

        // Add the ingredients array to the formData
        formData.append('ingredients', JSON.stringify(ingredients));

        // Add the delete image flag and the image file to formData
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        formData.append('deleteImage', deleteImage);

        try {
            // Await the returned recipe ID to ensure the update completed
            const recipeId = await updateRecipe(recipe._id, formData);
            router.push(`/recipes/${recipeId}`);
            notifySuccess();
        } catch (error) {
            notifyError();
            console.error('Error updating recipe:', error);
        }
    };

    return (
        <form onSubmit={updateRecipeById}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Image
                        src={recipe.image || 'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png'} // Provide a default image URL
                        alt={recipe.name || 'Recipe Image'}
                        width={300}
                        height={187}
                        className="w-full h-auto"
                        style={{ objectFit: 'cover' }}
                    />
                </Grid>

                {/* Image upload and delete option */}
                <Grid item xs={12}>
                    <Typography variant="h6">Recipe Image</Typography>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <FormControlLabel
                        control={<Checkbox checked={deleteImage} onChange={handleDeleteImageChange} />}
                        label="Delete current image and use default image"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Recipe Name"
                        name="name"
                        variant="outlined"
                        defaultValue={recipe.name}
                        fullWidth
                        required
                    />
                </Grid>

                {/* Category Dropdown */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            name="category"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            {Array.isArray(categories) && categories.length > 0 ? (
                                categories.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="" disabled>
                                    No categories available
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Ingredients Section */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Ingredients
                    </Typography>
                    {ingredients.map((ingredient, index) => (
                        <Grid container spacing={2} key={index}>
                            <Grid item xs={4}>
                                <TextField
                                    label="Ingredient"
                                    value={ingredient.ingredient.name || ingredient.ingredient}
                                    onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Unit"
                                    value={ingredient.unit}
                                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    ))}

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleAddIngredient}
                        sx={{ mt: 2 }}
                    >
                        Add Ingredient
                    </Button>
                </Grid>

                {/* Prep Time, Cook Time, and Serves Section */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Prep Time (minutes)"
                        name="prepTime"
                        type="number"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Cook Time (minutes)"
                        name="cookTime"
                        type="number"
                        value={cookTime}
                        onChange={(e) => setCookTime(e.target.value)}
                        fullWidth
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Serves"
                        name="serves"
                        type="number"
                        value={serves}
                        onChange={(e) => setServes(e.target.value)}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Steps"
                        name="steps"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Update Recipe
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default RecipeEditForm;