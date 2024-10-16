import connectDB from '../../config/database';
import Recipe from '../../models/Recipe';
import Category from '../../models/Category';
import RecipeOverviewCard from '../../components/RecipeOverviewCard';
import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import BackToHomeButton from '@/components/BacktoHomeButton';
import SearchBar from '@/components/SearchBar'; // Import the SearchBar component
// Fetch the data from MongoDB using Mongoose
export default async function RecipesPage({ searchParams }) {
    await connectDB();

    // Get the category from searchParams passed from the URL
    const categoryName = searchParams?.category || ''; // Default to empty if not present
    let recipes = [];

    if (categoryName) {
        // Fetch the category by name (case-insensitive)
        const category = await Category.findOne({ name: { $regex: new RegExp(categoryName, 'i') } });

        if (category) {
            console.log("Category found: ", category);
            // Fetch all recipes associated with this category
            recipes = await Recipe.find({ category: category._id }).lean();
        } else {
            console.log("Category not found");
        }
    }

    // Convert the document to a plain JS object so it can be passed to client components
    const recipesWithIds = convertToSerializeableObject(recipes);

    return (
        <Container>
            <SearchBar />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1>{categoryName ? `${categoryName} Recipes` : 'All Recipes'}</h1>
                <Grid container spacing={4} justifyContent="center">
                    {recipesWithIds.length > 0 ? (
                        recipesWithIds.map((recipe) => (
                            <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                                <RecipeOverviewCard recipe={recipe} />
                            </Grid>
                        ))
                    ) : (
                        <p>No recipes found for this category</p>
                    )}
                </Grid>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BackToHomeButton />
            </Box>
        </Container>
    );
}