import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IEmailVerificationToken extends Document {
	user: Types.ObjectId;
	email: string;
	tokenHash: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			index: true,
		},
		tokenHash: {
			type: String,
			required: true,
			unique: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
);

EmailVerificationTokenSchema.index({ user: 1, email: 1 }, { unique: true });
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationToken: Model<IEmailVerificationToken> =
	(mongoose.models.EmailVerificationToken as Model<IEmailVerificationToken>) ||
	mongoose.model<IEmailVerificationToken>(
		'EmailVerificationToken',
		EmailVerificationTokenSchema,
	);

export default EmailVerificationToken;
