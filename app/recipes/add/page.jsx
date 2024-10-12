import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';

export default async function handler(req, res) {
    await connectDB();

    if (req.method === 'POST') {
        try {
            const newRecipe = new Recipe(req.body);
            await newRecipe.save();
            res.status(201).json({ message: 'Recipe added successfully', recipe: newRecipe });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add recipe' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}