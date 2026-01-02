// models/User.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
	email: string;
	firstName: string;
	lastName: string;
	password?: string;
	image?: string;
	authProvider?: string;
	bookmarks?: mongoose.Types.ObjectId[];
	// Stores when the email was verified; null means not verified yet.
	emailVerified: Date | null;
	resetPasswordTokenHash?: string | null;
	resetPasswordExpires?: Date | null;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		password: { type: String },
		image: {
			type: String,
			default: null,
			validate: {
				validator: (v: string | null) => !v || v.startsWith('http'),
				message: 'Image must be a URL',
			},
		},
		authProvider: { type: String },
		emailVerified: { type: Date, default: null },
		resetPasswordTokenHash: { type: String, default: null },
		resetPasswordExpires: { type: Date, default: null },
		bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
	},
	{ timestamps: true }
);

// Hash the password before saving
UserSchema.pre<IUser>('save', async function (next: (err?: Error) => void) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password!, salt);
		next();
	} catch (err) {
		next(err as Error);
	}
});

// Compare password steps
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
) {
	// Password comparison only — verification is handled in authOptions
	return await bcrypt.compare(candidatePassword, this.password!);
};

const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
