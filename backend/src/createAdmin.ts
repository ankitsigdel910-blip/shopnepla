import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User';

// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();

// ============================================================
// DNS
// ============================================================
// Required on your current network because Node's default
// DNS resolver cannot resolve MongoDB Atlas SRV records.

dns.setServers([
  '1.1.1.1',
  '1.0.0.1',
]);

// ============================================================
// CREATE / UPDATE ADMIN
// ============================================================

const createAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI;

    const email =
      process.env.SEED_ADMIN_EMAIL;

    const password =
      process.env.SEED_ADMIN_PASSWORD;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI is missing'
      );
    }

    if (!email) {
      throw new Error(
        'SEED_ADMIN_EMAIL is missing'
      );
    }

    if (!password) {
      throw new Error(
        'SEED_ADMIN_PASSWORD is missing'
      );
    }

    if (password.length < 12) {
      throw new Error(
        'SEED_ADMIN_PASSWORD must be at least 12 characters'
      );
    }

    // ========================================================
    // CONNECT TO ATLAS
    // ========================================================

    console.log(
      'Connecting to MongoDB...'
    );

    await mongoose.connect(
      mongoUri
    );

    console.log(
      `MongoDB connected: ${mongoose.connection.name}`
    );

    // ========================================================
    // FIND USER
    // ========================================================

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      console.log(
        `User not found: ${normalizedEmail}`
      );

      console.log(
        'Register this account first, then run the script again.'
      );

      return;
    }

    // ========================================================
    // MAKE ADMIN
    // ========================================================

    user.role =
      'admin';

    user.isActive =
      true;

    /*
     * User.ts will automatically hash
     * this password using bcrypt before
     * saving.
     */
    user.password =
      password;

    await user.save();

    // ========================================================
    // SUCCESS
    // ========================================================

    console.log('');
    console.log(
      '================================'
    );

    console.log(
      'ADMIN ACCOUNT UPDATED'
    );

    console.log(
      '================================'
    );

    console.log(
      `Email: ${normalizedEmail}`
    );

    console.log(
      'Role: admin'
    );

    console.log(
      'Active: true'
    );

    console.log(
      'Password: reset successfully'
    );

    console.log(
      '================================'
    );
  } catch (error) {
    console.error(
      'Admin update failed:',
      error instanceof Error
        ? error.message
        : error
    );
  } finally {
    // ========================================================
    // DISCONNECT
    // ========================================================

    if (
      mongoose.connection
        .readyState !== 0
    ) {
      await mongoose.disconnect();

      console.log(
        'MongoDB disconnected.'
      );
    }
  }
};

// ============================================================
// RUN
// ============================================================

createAdmin();