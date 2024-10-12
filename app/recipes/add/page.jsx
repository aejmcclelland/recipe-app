import RecipeAddForm from '@/components/RecipeAddForm';
import BackToHomeButton from '@/components/BacktoHomeButton';
import { Box, Container } from '@mui/material';

const AddRecipePage = () => {
    return (
        <section>
            <Container>
                <h1>Add a New Recipe</h1>
                <RecipeAddForm />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <BackToHomeButton />
                </Box>
            </Container>
        </section>
    );
};

export default AddRecipePage;