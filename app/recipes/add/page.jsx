import RecipeAddForm from '@/components/RecipeAddForm';

const AddRecipePage = () => {
    return (
        <section>
            <div className="container">
                <h1>Add a New Recipe</h1>
                <RecipeAddForm />
            </div>
        </section>
    );
};

export default AddRecipePage;