// app/actions/updateProfileImage.js
'use server';

import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

/**
 * Uploads a new profile image to Cloudinary and persists the URL to the logged-in user.
 *
 * Notes:
 * - This action expects a Web File object (from an <input type="file" />) to be passed to the action.
 * - The user's `image` field stores the Cloudinary URL.
 */
export default async function updateProfileImage(imageFile) {
	await connectDB();

	const sessionUser = await getSessionUser();
	if (!sessionUser?.id) {
		throw new Error('You must be logged in to update your profile image.');
	}

	const userId = sessionUser.id;

	// Basic validation
	if (!imageFile || typeof imageFile.arrayBuffer !== 'function') {
		throw new Error('No valid image file provided.');
	}

	// Some environments provide `type` on File, some don’t — so be defensive.
	const mimeType = (imageFile.type ?? '').toString();
	if (mimeType && !mimeType.startsWith('image/')) {
		throw new Error('Please upload an image file.');
	}

	if (typeof imageFile.size === 'number' && imageFile.size <= 0) {
		throw new Error('No valid image file provided.');
	}

	let imageUrl;

	try {
		const buffer = Buffer.from(await imageFile.arrayBuffer());

		/** @type {{ secure_url?: string } | any} */
		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'profile_pictures',
					public_id: userId,
					overwrite: true,
					resource_type: 'image',
				},
				(error, uploadResult) => {
					if (error) {
						if (process.env.NODE_ENV === 'development') {
							console.error('Cloudinary upload error:', error);
						}
						reject(new Error('Image upload failed'));
						return;
					}
					resolve(uploadResult);
				}
			);

			uploadStream.end(buffer);
		});

		imageUrl = result?.secure_url;
		if (!imageUrl) {
			throw new Error('Image upload failed');
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed to upload profile image:', err);
		}
		throw err instanceof Error ? err : new Error('Image upload failed');
	}

	// Persist URL to user
	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ image: imageUrl },
		{ new: true }
	);

	if (!updatedUser) {
		throw new Error('User not found.');
	}

	return imageUrl;
}
