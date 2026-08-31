import crypto from 'crypto';
import axios from 'axios';

const PRODUCT_CODE =
  process.env.ESEWA_MERCHANT_ID ||
  'EPAYTEST';

const SECRET_KEY =
  process.env.ESEWA_SECRET_KEY || '';

const FORM_URL =
  process.env.ESEWA_FORM_URL ||
  'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

const STATUS_URL =
  process.env.ESEWA_STATUS_URL ||
  'https://rc.esewa.com.np/api/epay/transaction/status/';

interface InitiateParams {
  amount: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}

const ensureConfigured = () => {
  if (!SECRET_KEY) {
    throw new Error(
      'eSewa is not configured. ESEWA_SECRET_KEY is missing.'
    );
  }
};

const sign = (
  message: string
): string => {
  ensureConfigured();

  return crypto
    .createHmac(
      'sha256',
      SECRET_KEY
    )
    .update(message)
    .digest('base64');
};

export const buildEsewaFormFields = ({
  amount,
  transactionUuid,
  successUrl,
  failureUrl,
}: InitiateParams) => {
  ensureConfigured();

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      'Invalid eSewa payment amount'
    );
  }

  /*
   * eSewa transaction UUID supports
   * alphanumeric characters and hyphens.
   */
  const safeTransactionUuid =
    transactionUuid.replace(
      /[^a-zA-Z0-9-]/g,
      '-'
    );

  /*
   * Keep the exact same total_amount string
   * in both the signature and submitted form.
   */
  const totalAmount =
    String(amount);

  const signedFieldNames =
    'total_amount,transaction_uuid,product_code';

  const message =
    `total_amount=${totalAmount},` +
    `transaction_uuid=${safeTransactionUuid},` +
    `product_code=${PRODUCT_CODE}`;

  const signature =
    sign(message);

  return {
    formUrl: FORM_URL,

    fields: {
      amount:
        totalAmount,

      tax_amount:
        '0',

      total_amount:
        totalAmount,

      transaction_uuid:
        safeTransactionUuid,

      product_code:
        PRODUCT_CODE,

      product_service_charge:
        '0',

      product_delivery_charge:
        '0',

      success_url:
        successUrl,

      failure_url:
        failureUrl,

      signed_field_names:
        signedFieldNames,

      signature,
    },
  };
};

export const decodeEsewaCallback = (
  base64Data: string
) => {
  ensureConfigured();

  const json = Buffer.from(
    base64Data,
    'base64'
  ).toString('utf-8');

  const decoded =
    JSON.parse(json);

  if (
    !decoded ||
    !decoded.signed_field_names ||
    !decoded.signature
  ) {
    return {
      decoded,
      isValid: false,
    };
  }

  const message =
    String(
      decoded.signed_field_names
    )
      .split(',')
      .map(
        (field: string) =>
          `${field}=${decoded[field]}`
      )
      .join(',');

  const expectedSignature =
    sign(message);

  let signatureValid =
    false;

  try {
    const expected =
      Buffer.from(
        expectedSignature,
        'utf8'
      );

    const received =
      Buffer.from(
        String(
          decoded.signature
        ),
        'utf8'
      );

    signatureValid =
      expected.length ===
        received.length &&
      crypto.timingSafeEqual(
        expected,
        received
      );
  } catch {
    signatureValid =
      false;
  }

  return {
    decoded,

    isValid:
      signatureValid &&
      decoded.status ===
        'COMPLETE',
  };
};

export const verifyEsewaTransaction =
  async (
    transactionUuid: string,
    totalAmount: number
  ): Promise<boolean> => {
    ensureConfigured();

    try {
      const safeTransactionUuid =
        transactionUuid.replace(
          /[^a-zA-Z0-9-]/g,
          '-'
        );

      const {
        data,
      } = await axios.get(
        STATUS_URL,
        {
          params: {
            product_code:
              PRODUCT_CODE,

            total_amount:
              String(
                totalAmount
              ),

            transaction_uuid:
              safeTransactionUuid,
          },

          timeout: 15000,
        }
      );

      return (
        data?.status ===
        'COMPLETE'
      );
    } catch (error) {
      if (
        axios.isAxiosError(
          error
        )
      ) {
        console.error(
          'eSewa status verification failed:',
          error.response
            ?.data ||
            error.message
        );
      } else {
        console.error(
          'eSewa status verification failed:',
          error
        );
      }

      return false;
    }
  };