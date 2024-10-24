import RecipeEditForm from '@/components/RecipeEditForm';
import RecipeDeleteForm from '@/components/RecipeDeleteForm';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import Category from '@/models/Category'; // Import Category model
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { Container, Paper, Typography, Box, Button } from '@mui/material';

const RecipeEditPage = async ({ params }) => {
    await connectDB();

    // Find the recipe in the DB and convert it to a plain JavaScript object
    const recipeDoc = await Recipe.findById(params.id)
        .populate('ingredients.ingredient') // Populate the ingredient names
        .lean();
    const recipe = convertToSerializeableObject(recipeDoc);

    // Fetch all categories to pass to the form
    const categories = await Category.find({}).lean();
    const serializedCategories = convertToSerializeableObject(categories);

    if (!recipe) {
        return (
            <Container maxWidth="md">
                <Typography variant="h4" align="center" gutterBottom>
                    Recipe Not Found
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Edit Recipe
                </Typography>
                <Box mt={2}>
                    <RecipeEditForm recipe={recipe} categories={serializedCategories} />
                </Box>
                {/* <Box mt={4} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        href={`/recipes/${recipe._id}/edit`}
                    >
                        Edit Recipe
                    </Button>
                    <RecipeDeleteForm recipe={recipe} categories={serializedCategories} />
                </Box> */}
            </Paper>
        </Container>
    );
};

export default RecipeEditPage;