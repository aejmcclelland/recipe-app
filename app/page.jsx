import styles from './page.module.css';
import connectDB from '../config/database';
import Recipe from '../models/Recipe';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { Grid, Container, Typography } from '@mui/material';

export default async function Home() {
	await connectDB();

	const recipes = await Recipe.find({}, 'name image').lean();

	// Convert the document to a plain JS object so it can be passed to client components
	const recipesWithIds = convertToSerializeableObject(recipes);

	return (
		<Container maxWidth="lg">
			<Typography variant="h2" align="center" gutterBottom>
				Welcome to Rebekah's Recipes
			</Typography>
			<Typography variant="body1" align="center" gutterBottom>
				We are working hard to bring you the best recipes. Please be patient as we add more recipes to our collection.
			</Typography>

			<Grid container spacing={4} justifyContent="center">
				{recipesWithIds && recipesWithIds.length > 0 ? (
					recipesWithIds.map((recipe) => (
						<Grid item xs={12} sm={6} md={4} key={recipe._id}>
							<RecipeOverviewCard recipe={recipe} />
						</Grid>
					))
				) : (
					<Typography variant="body1">No recipes found.</Typography>
				)}
			</Grid>
		</Container>
	);
}