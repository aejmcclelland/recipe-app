import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Define TypeScript interface for the User model
export interface IUser extends Document {
	email: string;
	password?: string;
	firstName: string;
	lastName: string;
	image?: string;
	authProvider: 'local' | 'google';
	bookmarks: mongoose.Types.ObjectId[];
	comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define Mongoose Schema
const userSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
				message: (props: { value: string }) =>
					`${props.value} is not a valid email address!`,
			},
		},
		password: {
			type: String,
			required: function (this: IUser) {
				return this.authProvider !== 'google';
			},
		},
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		image: { type: String, default: '/images/default-profile.png' },
		authProvider: {
			type: String,
			required: true,
			enum: ['local', 'google'],
			default: 'local',
		},
		bookmarks: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Recipe',
				default: [],
			},
		],
	},
	{ timestamps: true }
);

// Virtual field for full name
userSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
userSchema.pre<IUser>('save', async function (next) {
	if (this.authProvider === 'local' && this.isModified('password')) {
		try {
			const salt = await bcrypt.genSalt(10);
			this.password = await bcrypt.hash(this.password, salt);
		} catch (err) {
			return next(err);
		}
	}
	next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
	candidatePassword: string
) {
	return (
		this.authProvider === 'local' &&
		(await bcrypt.compare(candidatePassword, this.password!))
	);
};

// Create or use existing model
const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
