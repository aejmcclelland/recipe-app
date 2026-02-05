// app/actions/resendVerificationEmail.ts
'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendMail } from '@/utils/mailer';

type ResendVerificationResult = {
	ok: true;
};

export async function resendVerificationEmail(
	emailRaw: unknown
): Promise<ResendVerificationResult> {
	await connectDB();

	const email = (emailRaw ?? '').toString().trim().toLowerCase();

	// Always return ok (prevents account enumeration)
	if (!email || !email.includes('@')) return { ok: true };

	const user = await User.findOne({ email });
	if (!user) return { ok: true };
	if (user.emailVerified) return { ok: true };

	if (!process.env.JWT_SECRET) {
		// Avoid breaking the flow if env is misconfigured 
		//  return ok to prevent account enumeration.
		console.error('JWT_SECRET is not configured');
		return { ok: true };
	}

	const token = jwt.sign({ email }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	});

	const rawSiteUrl =
		process.env.NODE_ENV === 'development'
			? 'http://localhost:3000'
			: process.env.NEXT_PUBLIC_SITE_URL;

	// Normalise (avoid trailing slash issues like "https://example.com/" -> "https://example.com//recipes")
	const siteUrl = (rawSiteUrl ?? 'http://localhost:3000').replace(/\/+$/, '');

	const normalizedSiteUrl = siteUrl.endsWith('/recipes') ? siteUrl : `${siteUrl}/recipes`;

	const verificationLink = `${normalizedSiteUrl}/verify?token=${token}`;

	const firstName = user.firstName || 'there';

	await sendMail({
		to: email,
		subject: 'Verify your email for Rebekah’s Recipes',
		text: `Hello ${firstName},\n\nPlease verify your email:\n\n${verificationLink}\n\nIf you didn’t request this, ignore this email.`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px 10px; box-sizing: border-box; color: #333;">
        <img src="https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_150,f_auto,q_auto/v1765666651/recipes-logo_ncjgf6.jpg" alt="Rebekah’s Recipes" style="max-width: 150px; display: block; margin: 0 auto 20px;">
        <h2 style="text-align: center; color: #d32f2f;">🍽️ Rebekah’s Recipes</h2>

        <p>Hi ${firstName},</p>

        <p>
          Welcome to <strong>Rebekah’s Recipes</strong>! Please confirm your email address to complete your registration.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display: inline-block; background-color: #d32f2f; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify your email
          </a>
        </div>

        <p>
          If you don’t see this email in your inbox within a few minutes, please check your spam, junk, or “Other” folders.
        </p>

        <p style="font-size: 14px; color: #555;">
          Some work or university email systems may block or delay automated emails. If this happens, you can resend the verification link from the sign-in page or register using a personal email address.
        </p>

        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p style="word-break: break-word;"><a href="${verificationLink}">${verificationLink}</a></p>

        <p style="font-size: 12px; color: #888;">
          If you didn’t create an account, you can safely ignore this email.
        </p>
      </div>
    `,
	}).catch((err) => {
		console.error('Resend verification email failed:', err);
	});

	return { ok: true };
}
