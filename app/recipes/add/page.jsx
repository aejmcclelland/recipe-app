import RecipeAddForm from '@/components/RecipeAddForm';
import { getCategories } from '@/app/actions/getCategories';
import BackToHomeButton from '@/components/BackToHomeButton';
import { Box, Container } from '@mui/material';

export default async function AddRecipePage() {
    const categories = await getCategories();

    return (
        <section>
            <Container>
                <RecipeAddForm categories={categories} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <BackToHomeButton />
                </Box>
            </Container>
        </section>
    );
}
