import styles from './page.module.css';
import connectDB from '../config/database';
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export default async function Home() {
	await connectDB();

	const recipes = await Recipe.find({}, 'name image').lean();

	// convert the document to a plain js object so it can passed to client
	// components
	const recipesWithIds = convertToSerializeableObject(recipes);

	// Convert MongoDB ObjectId to a string
	// const recipesWithIds = recipes.map(recipe => ({
	// 	...recipe,
	// 	_id: recipe._id.toString(),  // Convert ObjectId to string
	// }));

	console.log('These are fetched:', recipesWithIds);
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Welcome to Rebekah's Recipes</h1>
			<p className={styles.description}>
				We are working hard to bring you the best recipes.
				Please be patient as we add more recipes to our collection.
			</p>

			{/* Map over recipes and pass them individually to RecipeOverviewCard */}
			{recipesWithIds && recipesWithIds.length > 0 ? (
				recipesWithIds.map((recipe) => (
					<RecipeOverviewCard key={recipe._id} recipe={recipe} />
				))
			) : (
				<p>No recipes found.</p>
			)}
		</div>
	);
}
