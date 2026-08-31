import 'dotenv/config';
import nodemailer from 'nodemailer';

const testEmail = async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.verify();

    console.log('✅ Gmail SMTP login successful');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: 'ShopNepal Email Test',
      text: 'Your ShopNepal email configuration is working.',
    });

    console.log('✅ Test email sent successfully');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ EMAIL TEST FAILED');
    console.error(error);
  }
};

testEmail();