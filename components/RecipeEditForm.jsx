'use client';
import { Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';
import updateRecipe from '@/app/actions/editRecipe';
import Grid from '@mui/material/Grid2';
import { useState } from 'react';
import Image from 'next/image';

const RecipeEditForm = ({ recipe, categories = [] }) => {
    const [selectedCategory, setSelectedCategory] = useState(recipe.category);
    const [imageFile, setImageFile] = useState(null);
    const [deleteImage, setDeleteImage] = useState(false); // State to track if the user wants to delete the image

    const updateRecipeById = updateRecipe.bind(null, recipe._id);

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleImageChange = (event) => {
        setImageFile(event.target.files[0]);
    };

    const handleDeleteImageChange = (event) => {
        setDeleteImage(event.target.checked);
    };

    return (
        <form action={updateRecipeById}>
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
                    {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ingredient, index) => (
                            <Grid container spacing={2} key={index}>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Ingredient"
                                        name={`ingredients[${index}][ingredient]`}
                                        defaultValue={ingredient.ingredient.name} // assuming ingredient has a name property
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Quantity"
                                        name={`ingredients[${index}][quantity]`}
                                        type="number"
                                        defaultValue={ingredient.quantity}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        label="Unit"
                                        name={`ingredients[${index}][unit]`}
                                        defaultValue={ingredient.unit}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body1" color="textSecondary">
                            No ingredients added yet.
                        </Typography>
                    )}
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