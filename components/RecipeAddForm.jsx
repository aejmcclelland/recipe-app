'use client';
import { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

const RecipeAddForm = () => {
    const [ingredients, setIngredients] = useState([]);
    const [imageFile, setImageFile] = useState(null); // State for the image file

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
        setImageFile(e.target.files[0]);  // Capture the selected file
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target); // Collect form data
        formData.append('ingredients', JSON.stringify(ingredients)); // Add ingredients array as JSON
        if (imageFile) {
            formData.append('imageFile', imageFile); // Append the image file to the formData
        }

        const response = await fetch('/recipes/add', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Recipe added successfully');
        } else {
            console.error('Failed to add recipe');
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField label="Recipe Name" name="name" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Prep Time (minutes)" name="prepTime" type="number" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Cook Time (minutes)" name="cookTime" type="number" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Serves" name="serves" type="number" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Category" name="category" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1">Upload an image</Typography>
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Method" name="method" fullWidth multiline rows={4} required />
                </Grid>

                {/* Ingredients Fields */}
                {ingredients.map((ingredient, index) => (
                    <Grid item xs={12} key={index}>
                        <TextField
                            label="Ingredient"
                            value={ingredient.ingredient}
                            onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Quantity"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Unit"
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <Button onClick={handleAddIngredient}>Add Ingredient</Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" type="submit" fullWidth>
                        Add Recipe
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default RecipeAddForm;