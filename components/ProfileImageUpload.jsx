'use client';

import updateProfileImage from '@/app/actions/updateProfileImage';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import { Avatar, Box, IconButton, Tooltip } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ProfileImageUpload({
	user,
	onImageUpdated,
	fallbackIcon = null,
	appearance = 'default',
}) {
	const isProfile = appearance === 'profile';
	const { data: session, update } = useSession();

	const externalImage = user?.image || session?.user?.image || null;
	const [localImage, setLocalImage] = useState(null);
	const [failedImageUrl, setFailedImageUrl] = useState(null);
	const [uploading, setUploading] = useState(false);

	if (localImage && localImage.externalImage !== externalImage) {
		setLocalImage(null);
	}

	const imagePreview =
		localImage?.externalImage === externalImage
			? localImage.url
			: externalImage;

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			setUploading(true);

			try {
				// Directly call the server action
				const newImageUrl = await updateProfileImage(file);

				if (newImageUrl) {
					setLocalImage({ externalImage, url: newImageUrl }); // Update the image preview
					setFailedImageUrl(null);

					try {
						await update({
							...session,
							user: {
								...session?.user,
								image: newImageUrl,
							},
						});
					} catch (err) {
						// Not fatal; DB + preview have already updated
						console.warn('Failed to update session image:', err);
					}

					if (typeof onImageUpdated === 'function') {
						onImageUpdated(newImageUrl); // Notify the parent component
					}

					toast.success('Profile image updated successfully!');
				} else {
					throw new Error('Failed to update profile image');
				}
			} catch (error) {
				console.error('Error updating profile image:', error);
				toast.error('Error updating profile image. Please try again.');
			} finally {
				setUploading(false);
			}
		}
	};

	return (
		<Box
			sx={{
				position: 'relative',
				display: 'inline-block',
				width: 100,
				height: 100,
			}}>
			<Avatar
				src={
					imagePreview && failedImageUrl !== imagePreview
						? imagePreview
						: undefined
				}
				alt={user?.name || 'User Avatar'}
				slotProps={{
					img: {
						referrerPolicy: 'no-referrer',
					},
				}}
				onError={() => setFailedImageUrl(imagePreview)}
				sx={{
					width: 100,
					height: 100,
					borderRadius: '50%',
					objectFit: 'cover',
					boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
					...(isProfile && {
						boxShadow: 'none',
						border: '1px solid',
						borderColor: 'divider',
						bgcolor: 'action.hover',
						color: 'text.secondary',
					}),
				}}>
				{fallbackIcon ?? <AccountCircleIcon fontSize='large' />}
			</Avatar>

			<Tooltip title='Change profile picture'>
				<IconButton
					component='label'
					aria-label={isProfile ? 'Change profile picture' : undefined}
					sx={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						width: { xs: 30, sm: 28 },
						height: { xs: 30, sm: 28 },
						backgroundColor: '#d32f2f',
						color: '#fff',
						borderRadius: '50%',
						boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
						'&:hover': {
							backgroundColor: '#b71c1c',
						},
						...(isProfile && {
							width: { xs: 28, sm: 30 },
							height: { xs: 28, sm: 30 },
							bgcolor: 'background.paper',
							color: 'text.primary',
							border: '1px solid',
							borderColor: 'divider',
							boxShadow: 'none',
							'&:hover': { bgcolor: 'action.hover' },
						}),
					}}>
					<AddIcon />
					<input
						type='file'
						accept='image/*'
						hidden
						onChange={handleFileChange}
						disabled={uploading}
					/>
				</IconButton>
			</Tooltip>
		</Box>
	);
}
