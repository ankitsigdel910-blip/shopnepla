import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Product from './models/Product';
import Category from './models/Category';

dotenv.config();

dns.setServers([
  '1.1.1.1',
  '1.0.0.1',
]);

const OLD_URL =
  'http://localhost:5000';

const NEW_URL =
  'https://shopnepal-api.onrender.com';

const fixImageUrls = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is missing'
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      `Connected to: ${mongoose.connection.name}`
    );

    if (
      mongoose.connection.name !==
      'ecommerce-store'
    ) {
      throw new Error(
        `Wrong database: ${mongoose.connection.name}`
      );
    }

    // ==========================================
    // PRODUCTS
    // ==========================================

    const products =
      await Product.find({});

    let productCount = 0;

    for (const product of products) {
      let changed = false;

      product.images =
        product.images.map(
          (image) => {
            if (
              image.startsWith(
                OLD_URL
              )
            ) {
              changed = true;

              return image.replace(
                OLD_URL,
                NEW_URL
              );
            }

            return image;
          }
        );

      if (changed) {
        await product.save();

        productCount++;

        console.log(
          `Updated product: ${product.name}`
        );
      }
    }

    // ==========================================
    // CATEGORIES
    // ==========================================

    const categories =
      await Category.find({});

    let categoryCount = 0;

    for (const category of categories) {
      if (
        category.image &&
        category.image.startsWith(
          OLD_URL
        )
      ) {
        category.image =
          category.image.replace(
            OLD_URL,
            NEW_URL
          );

        await category.save();

        categoryCount++;

        console.log(
          `Updated category: ${category.name}`
        );
      }
    }

    // ==========================================
    // RESULT
    // ==========================================

    console.log('');
    console.log(
      '=============================='
    );

    console.log(
      'IMAGE URL UPDATE COMPLETE'
    );

    console.log(
      `Products updated: ${productCount}`
    );

    console.log(
      `Categories updated: ${categoryCount}`
    );

    console.log(
      '=============================='
    );
  } catch (error) {
    console.error(
      'Failed:',
      error
    );
  } finally {
    await mongoose.disconnect();
  }
};

fixImageUrls();