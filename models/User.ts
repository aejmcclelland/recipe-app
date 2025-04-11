import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
	email: string;
	firstName: string;
	lastName: string;
	image?: string;
	authProvider?: string;
	bookmarks?: mongoose.Types.ObjectId[];
	comparePassword?: (password: string) => Promise<boolean>;
}

// Check if User model already exists (Prevents recompilation issues)
const UserSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		image: { type: String },
		authProvider: { type: String },
		bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
	},
	{
		timestamps: true,
	}
);

// Optional method for password comparison
UserSchema.methods.comparePassword = async function (password: string) {
	// dummy implementation - override with bcrypt if needed
	return password === 'test';
};

const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
