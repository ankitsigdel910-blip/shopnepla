import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/* ============================================================
   CREATE EMAIL TRANSPORTER
============================================================ */

const createTransporter = () => {
  const host =
    process.env.EMAIL_HOST?.trim();

  const port = Number(
    process.env.EMAIL_PORT || 587
  );

  const user =
    process.env.EMAIL_USER?.trim();

  const password =
    process.env.EMAIL_PASSWORD?.replace(
      /\s+/g,
      ''
    );

  if (!host) {
    throw new Error(
      'EMAIL_HOST is not configured'
    );
  }

  if (!user) {
    throw new Error(
      'EMAIL_USER is not configured'
    );
  }

  if (!password) {
    throw new Error(
      'EMAIL_PASSWORD is not configured'
    );
  }

  if (
    !Number.isFinite(port) ||
    port <= 0
  ) {
    throw new Error(
      'EMAIL_PORT is invalid'
    );
  }

  return nodemailer.createTransport({
    host,
    port,

    // Port 465 uses implicit TLS.
    // Port 587 starts normally and upgrades using STARTTLS.
    secure: port === 465,

    auth: {
      user,
      pass: password,
    },

    requireTLS:
      port === 587,
  });
};

/* ============================================================
   SEND EMAIL
============================================================ */

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<void> => {
  const user =
    process.env.EMAIL_USER?.trim();

  const from =
    process.env.EMAIL_FROM?.trim() ||
    `ShopNepal <${user}>`;

  if (!to?.trim()) {
    throw new Error(
      'Email recipient is required'
    );
  }

  const transporter =
    createTransporter();

  try {
    const info =
      await transporter.sendMail({
        from,
        to: to.trim(),
        subject,
        text,
        html,
      });

    console.log(
      'Email sent successfully:',
      info.messageId
    );
  } catch (error) {
    console.error(
      'Failed to send email:',
      error
    );

    throw error;
  }
};

/* ============================================================
   VERIFY SMTP CONNECTION
============================================================ */

export const verifyEmailConnection =
  async (): Promise<void> => {
    const transporter =
      createTransporter();

    try {
      await transporter.verify();

      console.log(
        'Email server connected successfully'
      );
    } catch (error) {
      console.error(
        'Email server connection failed:',
        error
      );

      throw error;
    }
  };