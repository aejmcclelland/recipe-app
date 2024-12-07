import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
				message: (props) => `${props.value} is not a valid email address!`,
			},
		},
		password: {
			type: String,
			required: function () {
				return this.authProvider !== 'google';
			},
		},
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		image: { type: String, default: 'default-profile.png' },
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
	{ timestamps: true } // Add timestamps
);

// Virtual field for full name
userSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (candidatePassword) {
	return (
		this.authProvider === 'local' &&
		(await bcrypt.compare(candidatePassword, this.password))
	);
};

// Export the model
export default mongoose.models.User || mongoose.model('User', userSchema);
