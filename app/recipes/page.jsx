import connectDB from '../../config/database';
import Recipe from '../../models/Recipe';
import Category from '../../models/Category';
import RecipeCard from '../../components/RecipeCard';
import { Box, Container } from '@mui/material';
import { convertToSerializeableObject } from '@/utils/convertToObject';

// Fetch the data from MongoDB using Mongoose
export default async function RecipesPage({ searchParams }) {
    await connectDB();
    console.log("searchParams: ", searchParams);
    // Get the category from searchParams passed from the URL
    const categoryName = searchParams?.category || ''; // Default to empty if not present
    let recipes = [];

    if (categoryName) {
        // Fetch the category by name
        const category = await Category.findOne({ name: categoryName });
        if (category) {
            console.log("Category found: ", category);
        } else {
            console.log("Category not found");
        }
        if (category) {
            // Fetch all recipes associated with this category
            recipes = await Recipe.find({ category: category._id }).populate('ingredients.ingredient').lean();
        }
    }
    console.log("Recipes fetched: ", recipes);

    // Convert the document to a plain JS object so it can passed to client components
    const recipesWithIds = convertToSerializeableObject(recipes);

    return (
        <Container>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1>{categoryName ? `${categoryName} Recipes` : 'All Recipes'}</h1>
                {recipesWithIds.length > 0 ? (
                    recipesWithIds.map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} />)
                ) : (
                    <p>No recipes found for this category</p>
                )}
            </Box>
        </Container>
    );
}