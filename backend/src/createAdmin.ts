import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'ankitsigdel910@gmail.com';

    // Choose your own strong temporary password
    const newPassword = 'ChangeMe@12345!';

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found. Register the account first.');
      return;
    }

    user.role = 'admin';
    user.isActive = true;
    user.password = newPassword;

    await user.save();

    console.log('Admin account updated successfully');
    console.log(`Email: ${email}`);
    console.log('Password was reset to the value in createAdmin.ts');
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();