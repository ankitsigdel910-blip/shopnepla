import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './app';
import connectDB from './config/db';

// ============================================================
// DNS CONFIGURATION
// ============================================================
// Your network's default DNS can resolve Atlas through nslookup,
// but Node's SRV resolver is being refused.
//
// Cloudflare DNS fixes the MongoDB Atlas SRV lookup.

dns.setServers([
  '1.1.1.1',
  '1.0.0.1',
]);

// ============================================================
// SERVER CONFIGURATION
// ============================================================

const PORT =
  process.env.PORT ||
  5000;

// ============================================================
// START SERVER
// ============================================================

const start = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    const server =
      app.listen(
        PORT,
        () => {
          console.log(
            `Server running in ${
              process.env.NODE_ENV ||
              'development'
            } mode on port ${PORT}`
          );
        }
      );

    // ========================================================
    // UNHANDLED PROMISE REJECTIONS
    // ========================================================

    process.on(
      'unhandledRejection',
      (err: Error) => {
        console.error(
          `Unhandled Rejection: ${err.message}`
        );

        server.close(
          () =>
            process.exit(1)
        );
      }
    );

    // ========================================================
    // UNCAUGHT EXCEPTIONS
    // ========================================================

    process.on(
      'uncaughtException',
      (err: Error) => {
        console.error(
          `Uncaught Exception: ${err.message}`
        );

        server.close(
          () =>
            process.exit(1)
        );
      }
    );

    // ========================================================
    // GRACEFUL SHUTDOWN
    // ========================================================

    process.on(
      'SIGTERM',
      () => {
        console.log(
          'SIGTERM received. Shutting down gracefully...'
        );

        server.close(
          () =>
            process.exit(0)
        );
      }
    );
  } catch (error) {
    console.error(
      `Failed to start server: ${
        error instanceof Error
          ? error.message
          : error
      }`
    );

    process.exit(1);
  }
};

// ============================================================
// RUN
// ============================================================

start();