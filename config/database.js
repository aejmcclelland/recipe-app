// config/database.js
import mongoose from 'mongoose';

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
	console.log('MongoDB connected...');
};

export default connectDB;
