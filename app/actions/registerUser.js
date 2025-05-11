'use server';

import User from '@/models/User';
import connectDB from '@/config/database';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

export default async function registerUser(formData) {
	await connectDB();
	const { firstName, lastName, email, password } = formData;

	// Capitalize first letter, lowercase rest
	const formatName = (name) =>
		name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

	const formattedFirstName = formatName(firstName.trim());
	const formattedLastName = formatName(lastName.trim());

	const sanitizedEmail = email.toLowerCase().trim();

	try {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(sanitizedEmail)) {
			throw new Error('Invalid email format.');
		}

		if (!password || password.length < 8) {
			throw new Error('Password must be at least 8 characters.');
		}

		const existingUser = await User.findOne({ email: sanitizedEmail });
		if (existingUser) {
			return {
				success: false,
				message:
					'Unable to register with that email. Please try again or log in.',
			};
		}

		const newUser = new User({
			firstName: formattedFirstName,
			lastName: formattedLastName,
			email: sanitizedEmail,
			...(password && { password }),
		});

		const token = jwt.sign({ email: sanitizedEmail }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});

		sgMail.setApiKey(process.env.SENDGRID_API_KEY);

		const siteUrl =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:3000'
				: process.env.NEXT_PUBLIC_SITE_URL;

		const normalizedSiteUrl = siteUrl.endsWith('/recipes')
			? siteUrl
			: `${siteUrl}/recipes`;

		const verificationLink = `${normalizedSiteUrl}/verify?token=${token}`;

		const msg = {
			to: sanitizedEmail,
			from: `"Rebekah's Recipes" <${process.env.SENDGRID_SENDER}>`,
			subject: 'Verify your email for Rebekah’s Recipes',
			text: `Hello ${formattedFirstName},\n\nWelcome to Rebekah’s Recipes!\n\nPlease verify your email by clicking this link:\n\n${verificationLink}\n\nIf you didn’t create an account, you can safely ignore this email.\n\nThe Rebekah’s Recipes Team`,
			html: `
		    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px 10px; box-sizing: border-box; color: #333;">
		      <img src="https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/t_email-opt/rebekahs-logo.png" alt="Rebekah’s Recipes" style="max-width: 150px; display: block; margin: 0 auto 20px;">
		      <h2 style="text-align: center; color: #d32f2f;">🍽️ Rebekah’s Recipes</h2>
		      <p>Hi ${formattedFirstName},</p>
		      <p>Welcome to <strong>Rebekah’s Recipes</strong>! Please confirm your email address to get started.</p>
		      <div style="text-align: center; margin: 30px 0;">
		        <a href="${verificationLink}" style="display: inline-block; background-color: #d32f2f; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Email</a>
		      </div>
		      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
		      <p style="word-break: break-word;"><a href="${verificationLink}">${verificationLink}</a></p>
		      <hr>
		      <p style="font-size: 12px; color: #999;">You’re receiving this email because you registered at RebekahsRecipes.com. If this wasn’t you, you can ignore this email.</p>
		    </div>
		    `,
		};

		await newUser.save();
		await sgMail.send(msg);

		return { success: true };
	} catch (error) {
		console.error('Registration error:', error);
		throw new Error(
			error.message || 'An unexpected error occurred. Please try again.'
		);
	}
}
