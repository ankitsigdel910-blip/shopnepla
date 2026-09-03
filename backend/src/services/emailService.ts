import nodemailer from 'nodemailer';

/* ============================================================
   TYPES
============================================================ */

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/* ============================================================
   CREATE TRANSPORTER
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

  /* ==========================================================
     VALIDATE CONFIGURATION
  ========================================================== */

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

  /* ==========================================================
     SMTP TRANSPORT
  ========================================================== */

  return nodemailer.createTransport({
    host,
    port,

    // Port 465 uses SSL/TLS immediately.
    // Port 587 uses STARTTLS.
    secure: port === 465,

    auth: {
      user,
      pass: password,
    },

    requireTLS: port === 587,

    /* ========================================================
       TIMEOUTS

       Prevent Render requests from hanging for several minutes
       when the SMTP server cannot be reached.
    ======================================================== */

    connectionTimeout: 10_000,

    greetingTimeout: 10_000,

    socketTimeout: 15_000,
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
      'SMTP email sending failed:',
      error
    );

    throw error;
  }
};

/* ============================================================
   VERIFY EMAIL CONNECTION
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