'use server';

import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

export default async function updateProfileImage(imageFile) {
	// Connect to the database
	await connectDB();

	// Get the logged-in user's session
	const sessionUser = await getSessionUser();

	if (!sessionUser || !sessionUser.user?.id) {
		throw new Error('You must be logged in to update your profile image.');
	}

	const userId = sessionUser.user.id;

	// Handle image upload to Cloudinary
	let imageUrl;
	if (imageFile && imageFile.size > 0) {
		const buffer = Buffer.from(await imageFile.arrayBuffer());

		// Use Cloudinary's upload stream
		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder: 'profile_pictures', public_id: userId, overwrite: true },
				(error, result) => {
					if (error) {
						console.error('Cloudinary upload error:', error);
						reject(new Error('Image upload failed'));
					} else {
						resolve(result);
					}
				}
			);
			uploadStream.end(buffer); // Pass the buffer to the stream
		});

		imageUrl = result.secure_url; // Get the secure URL of the uploaded image
	} else {
		throw new Error('No valid image file provided.');
	}

	// Update the user's profile image in the database
	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ image: imageUrl },
		{ new: true } // Return the updated user document
	);

	if (!updatedUser) {
		throw new Error('User not found.');
	}

	return imageUrl; // Return the new image URL for immediate use
}
