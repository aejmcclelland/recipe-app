//utils/mailer.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.MAILEROO_HOST,
	port: Number(process.env.MAILEROO_PORT),
	secure: false,
	auth: {
		user: process.env.MAILEROO_USER,
		pass: process.env.MAILEROO_PASS,
	},
});

export async function sendMail({ to, subject, text, html }) {
	return transporter.sendMail({
		from: process.env.MAILEROO_FROM,
		to,
		subject,
		text,
		html,
	});
}