'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { resendVerificationEmail } from '@/app/actions/resendVerificationEmail';

export type UpdateProfileDetailsInput = {
  email: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateProfileDetailsResult = {
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };
  requiresEmailVerification: boolean;
};

const normalizeEmail = (value: unknown): string =>
  (value ?? '').toString().trim().toLowerCase();

const normalizeName = (value: unknown): string => (value ?? '').toString().trim();

/**
 * Updates the logged-in user's profile.
 * If the email address changes, the user is required to verify the new email again
 */
export default async function updateProfileDetails(
  { email, firstName, lastName }: UpdateProfileDetailsInput
): Promise<UpdateProfileDetailsResult> {
  await connectDB();

  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) {
    throw new Error('You must be logged in to update your profile details.');
  }

  const user = await User.findById(sessionUser.id);
  if (!user) {
    throw new Error('User not found.');
  }

  // Normalise inputs
  const nextEmail = normalizeEmail(email);
  const nextFirstName = normalizeName(firstName);
  const nextLastName = normalizeName(lastName);

  if (!nextEmail || !nextEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // If names were omitted/blank, keep existing values
  const effectiveFirstName = nextFirstName || normalizeName(user.firstName);
  const effectiveLastName = nextLastName || normalizeName(user.lastName);

  if (!effectiveFirstName || !effectiveLastName) {
    throw new Error('Please enter your first and last name.');
  }

  const currentEmail = normalizeEmail(user.email);
  const emailChanged = nextEmail !== currentEmail;

  // Prevent duplicates if user is changing email
  if (emailChanged) {
    const existing = await User.findOne({
      email: nextEmail,
      _id: { $ne: sessionUser.id },
    })
      .select('_id')
      .lean();

    if (existing) {
      throw new Error('That email is already in use. Please use a different email address.');
    }
  }

  // Apply updates
  user.email = nextEmail;
  user.firstName = effectiveFirstName;
  user.lastName = effectiveLastName;

  // Email re-verification flow
  if (emailChanged) {
    // Require verification again when email changes
    user.emailVerified = null;
  }

  const saved = await user.save();

  // email (don’t block the profile update if it fails)
  if (emailChanged) {
    try {
      await resendVerificationEmail(nextEmail);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send verification email after email change:', err);
      }
    }
  }

  return {
    success: true,
    user: {
      id: saved._id.toString(),
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      emailVerified: Boolean(saved.emailVerified),
    },
    requiresEmailVerification: emailChanged,
  };
}
