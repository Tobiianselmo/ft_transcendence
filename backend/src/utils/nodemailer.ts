 

import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER || 'user@gmail.com',
			pass: process.env.EMAIL_PASS || 'password',
		},
	});

	const mailOptions = {
		from: '"ft_transcendence 42 Malaga" <transcendence.42malaga@gmail.com>',
		to: `${to}`,
		subject: `${subject}`,
		text: `${text}`,
	};

	const info = await transporter.sendMail(mailOptions);
}
