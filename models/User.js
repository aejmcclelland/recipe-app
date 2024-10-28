import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: {
		type: String,
		required: function () {
			// Require password only if the authProvider is 'local'
			return this.authProvider === 'local';
		},
	},
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	image: String,
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
		},
	],
});

// Password hashing middleware for 'local' provider
userSchema.pre('save', async function (next) {
	if (this.authProvider === 'local' && this.isModified('password')) {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

// Method to compare password for 'local' provider
userSchema.methods.comparePassword = async function (candidatePassword) {
	return (
		this.authProvider === 'local' &&
		(await bcrypt.compare(candidatePassword, this.password))
	);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
