'use client';
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function RecipeAddForm({ onSubmit }) {
    const [name, setName] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [serves, setServes] = useState('');
    const [image, setImage] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [method, setMethod] = useState('');

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index][field] = value;
        setIngredients(updatedIngredients);
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const recipeData = {
            name,
            prepTime,
            cookTime,
            serves,
            image,
            ingredients,
            method,
        };
        onSubmit(recipeData); // Function to handle the form submission
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Add/Update Recipe
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Recipe Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Preparation Time (in minutes)"
                            value={prepTime}
                            onChange={(e) => setPrepTime(e.target.value)}
                            type="number"
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Cook Time (in minutes)"
                            value={cookTime}
                            onChange={(e) => setCookTime(e.target.value)}
                            type="number"
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Serves"
                            value={serves}
                            onChange={(e) => setServes(e.target.value)}
                            type="number"
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Image URL"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            required
                        />
                    </Grid>

                    {ingredients.map((ingredient, index) => (
                        <Grid container spacing={2} key={index}>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Ingredient Name"
                                    value={ingredient.name}
                                    onChange={(e) =>
                                        handleIngredientChange(index, 'name', e.target.value)
                                    }
                                    required
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) =>
                                        handleIngredientChange(index, 'quantity', e.target.value)
                                    }
                                    type="number"
                                    required
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Unit (g, ml, etc.)"
                                    value={ingredient.unit}
                                    onChange={(e) =>
                                        handleIngredientChange(index, 'unit', e.target.value)
                                    }
                                    required
                                />
                            </Grid>
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Button onClick={handleAddIngredient} variant="outlined">
                            Add Ingredient
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            multiline
                            rows={4}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                            Submit Recipe
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}