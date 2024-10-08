'use client';
import styles from './page.module.css';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';

export default function FeaturedRecipes({ recipes }) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to Rebekah's Recipes</h1>
            <p className={styles.description}>
                Discover our favorite family recipes!
            </p>
            <div className={styles.recipeGrid}>
                {recipes.map((recipe) => (
                    <RecipeOverviewCard key={recipe._id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}