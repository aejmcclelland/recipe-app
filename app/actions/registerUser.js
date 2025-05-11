'use server';

import User from '@/models/User';
import connectDB from '@/config/database';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

export default async function registerUser(formData) {
	await connectDB();
	const { firstName, lastName, email, password } = formData;
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
			throw new Error(
				'Unable to register with that email. Please try again or log in.'
			);
		}

		const newUser = new User({
			firstName,
			lastName,
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
			text: `Hello ${firstName},\n\nThank you for registering at Rebekah’s Recipes. Please verify your email by clicking this link: ${verificationLink}\n\nThis link will expire in 1 hour.`,
			html: `
        <p>Hello ${firstName},</p>
        <p>Thank you for registering at Rebekah’s Recipes. Please click the link below to verify your email address:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>
        <p>This link will expire in 1 hour.</p>
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
