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
	verified: boolean;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		password: { type: String }, // ← ADD THIS
		image: { type: String },
		authProvider: { type: String },
		verified: { type: Boolean, default: false },
		bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
	},
	{ timestamps: true }
);

// Hash the password before saving
UserSchema.pre<IUser>('save', async function (next) {
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
	if (!this.verified) {
		throw new Error('Please verify your email before logging in.');
	}
	return await bcrypt.compare(candidatePassword, this.password!);
};

const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
