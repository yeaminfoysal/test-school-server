// import nodemailer from 'nodemailer';

// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }

// let transporter: nodemailer.Transporter;

// // Initialize email transporter
// const initializeEmailService = () => {
//   if (process.env.NODE_ENV === 'development') {
//     // Use Ethereal Email for development
//     transporter = nodemailer.createTransporter({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       auth: {
//         user: 'ethereal.user@ethereal.email',
//         pass: 'ethereal.pass',
//       },
//     });
//   } else {
//     // Use your production email service (e.g., SendGrid, AWS SES, etc.)
//     transporter = nodemailer.createTransporter({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: process.env.SMTP_SECURE === 'true',
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });
//   }
// };

// export const sendEmail = async (options: EmailOptions): Promise<void> => {
//   if (!transporter) {
//     initializeEmailService();
//   }

//   const mailOptions = {
//     from: `"Test_School" <${process.env.FROM_EMAIL || 'noreply@testschool.com'}>`,
//     to: options.to,
//     subject: options.subject,
//     html: options.html,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
    
//     if (process.env.NODE_ENV === 'development') {
//       console.log('Email sent:', nodemailer.getTestMessageUrl(info));
//     }
//   } catch (error) {
//     console.error('Email sending failed:', error);
//     throw new Error('Failed to send email');
//   }
// };