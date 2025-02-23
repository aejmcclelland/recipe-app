import mongoose from 'mongoose';
import Category from '@/models/Category'; // Import models explicitly
import Recipe from '@/models/Recipe';
import User from '@/models/User';

let connected = false;

const connectDB = async () => {
	mongoose.set('strictQuery', true); // Use strict mode for query filters

	if (connected) {
		console.log('MongoDB is already connected...');
		return;
	}

	// Connect to MongoDB using connection string from .env
	await mongoose.connect(process.env.MONGODB_URI);

	connected = true;
};

export default connectDB;
