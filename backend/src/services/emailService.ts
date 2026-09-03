import { Resend } from 'resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/* ============================================================
   RESEND CLIENT
============================================================ */

const getResendClient = () => {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not configured'
    );
  }

  return new Resend(apiKey);
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
  if (!to?.trim()) {
    throw new Error(
      'Email recipient is required'
    );
  }

  const resend =
    getResendClient();

  const from =
    process.env.EMAIL_FROM?.trim() ||
    'ShopNepal <onboarding@resend.dev>';

  try {
    const {
      data,
      error,
    } = await resend.emails.send({
      from,
      to: [to.trim()],
      subject,
      text:
        text ||
        'Please view this email in an HTML-compatible email client.',
      html,
    });

    if (error) {
      throw new Error(
        error.message
      );
    }

    console.log(
      'Email sent successfully:',
      data?.id
    );
  } catch (error) {
    console.error(
      'Email API sending failed:',
      error
    );

    throw error;
  }
};

/* ============================================================
   CONNECTION CHECK
============================================================ */

export const verifyEmailConnection =
  async (): Promise<void> => {
    if (
      !process.env.RESEND_API_KEY?.trim()
    ) {
      throw new Error(
        'RESEND_API_KEY is not configured'
      );
    }

    console.log(
      'Resend email configuration loaded'
    );
  };