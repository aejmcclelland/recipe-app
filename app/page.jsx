import styles from './page.module.css';
import connectDB from '../config/database';
import Recipe from '../models/Recipe';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { Container, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2'; // For Material UI Grid2 system
import SearchBar from '@/components/SearchBar'; // Import the SearchBar component

export default async function Home() {
	await connectDB();

	const recipes = await Recipe.find({}, 'name image').lean();

	// Convert the document to a plain JS object so it can be passed to client components
	const recipesWithIds = convertToSerializeableObject(recipes);

	return (
		<Container maxWidth="lg">
			<SearchBar />
			{/* Page Title */}
			<Box sx={{ textAlign: 'center', my: 4 }}>
				<Typography variant="h2" align="center" gutterBottom>
					Welcome to Rebekah&#39;s Recipes!
				</Typography>
				<Typography variant="body1" align="center" gutterBottom>
					We are working hard to bring you the best recipes. Please be patient as we add more recipes to our collection.
				</Typography>
			</Box>

			{/* Recipes Grid */}
			<Grid container spacing={4} justifyContent="center">
				{recipesWithIds && recipesWithIds.length > 0 ? (
					recipesWithIds.map((recipe) => (
						<Grid item xs={12} sm={6} md={4} key={recipe._id}>
							<RecipeOverviewCard recipe={recipe} />
						</Grid>
					))
				) : (
					<Grid item xs={12}>
						<Typography variant="body1" align="center">
							No recipes found.
						</Typography>
					</Grid>
				)}
			</Grid>
		</Container>
	);
}