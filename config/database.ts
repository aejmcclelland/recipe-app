import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI:', process.env.MONGODB_URI);
if (!MONGODB_URI) {
	throw new Error('Missing MONGODB_URI in environment variables.');
}

let isConnected = false;

const connectDB = async () => {
	if (isConnected) {
		console.log(' MongoDB already connected');
		return;
	}

	try {
		await mongoose.connect(MONGODB_URI, {
			dbName: 'rebekahs-recipes', // This is still necessary
		});

		isConnected = true;
		console.log(' MongoDB connected successfully');
	} catch (error) {
		console.error(' MongoDB connection error:', error);
		throw new Error('Database connection failed');
	}
};

export default connectDB;
