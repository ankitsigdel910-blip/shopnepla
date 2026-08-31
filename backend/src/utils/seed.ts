import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Review from '../models/Review';
import Coupon from '../models/Coupon';

const run = async () => {
  await connectDB();
  console.log('Seeding database...');

  // Wipe existing sample data (idempotent re-runs)
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  // --- Admin + customers ---
  const admin = await User.create({
    name: 'Store Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    phone: '9800000001',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
    role: 'admin',
  });

  const customers = await User.create([
    { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9800000002', password: 'Password123', role: 'customer' },
    { name: 'Sita Gurung', email: 'sita@example.com', phone: '9800000003', password: 'Password123', role: 'customer' },
  ]);

  // --- Categories ---
  const categories = await Category.create([
    { name: 'Electronics', description: 'Phones, laptops, gadgets and accessories' },
    { name: 'Fashion', description: 'Clothing, footwear and accessories' },
    { name: 'Home & Kitchen', description: 'Appliances, cookware and home essentials' },
    { name: 'Beauty & Personal Care', description: 'Skincare, haircare and grooming' },
  ]);

  // --- Products ---
  const productSeeds = [
    {
      name: 'Aurora X12 Smartphone',
      description: '6.7" AMOLED display, 128GB storage, 5000mAh battery.',
      price: 45000,
      discountPrice: 41999,
      category: categories[0]._id,
      brand: 'Aurora',
      stock: 25,
      sku: 'ELEC-PHN-001',
      isFeatured: true,
      images: [],
    },
    {
      name: 'Nova Air Wireless Earbuds',
      description: 'Active noise cancellation, 30-hour battery life.',
      price: 6500,
      category: categories[0]._id,
      brand: 'Nova',
      stock: 60,
      sku: 'ELEC-AUD-002',
      isFeatured: true,
      images: [],
    },
    {
      name: 'Everyday Cotton T-Shirt',
      description: '100% breathable cotton, regular fit, machine washable.',
      price: 1200,
      discountPrice: 899,
      category: categories[1]._id,
      brand: 'Basics Co.',
      stock: 150,
      sku: 'FASH-TSH-001',
      images: [],
    },
    {
      name: 'Trailblazer Running Shoes',
      description: 'Lightweight cushioned sole, breathable mesh upper.',
      price: 4500,
      category: categories[1]._id,
      brand: 'Trailblazer',
      stock: 40,
      sku: 'FASH-SHO-002',
      isFeatured: true,
      images: [],
    },
    {
      name: 'ChefPro Non-Stick Cookware Set (5pc)',
      description: 'Induction-compatible, PFOA-free non-stick coating.',
      price: 8900,
      category: categories[2]._id,
      brand: 'ChefPro',
      stock: 20,
      sku: 'HOME-COO-001',
      images: [],
    },
    {
      name: 'GlowLeaf Vitamin C Serum',
      description: '20% Vitamin C serum for brightening and even skin tone.',
      price: 1500,
      discountPrice: 1199,
      category: categories[3]._id,
      brand: 'GlowLeaf',
      stock: 80,
      sku: 'BEAU-SER-001',
      images: [],
    },
  ];

  const products = await Product.create(productSeeds);

  // --- Reviews ---
  await Review.create([
    { user: customers[0]._id, product: products[0]._id, rating: 5, comment: 'Excellent display and battery life!' },
    { user: customers[1]._id, product: products[0]._id, rating: 4, comment: 'Great phone, camera could be better.' },
    { user: customers[0]._id, product: products[1]._id, rating: 5, comment: 'Sound quality is amazing for the price.' },
  ]);

  for (const p of [products[0], products[1]]) {
    const revs = await Review.find({ product: p._id });
    p.rating = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
    p.numReviews = revs.length;
    await p.save();
  }

  // --- Coupons ---
  await Coupon.create([
    {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderAmount: 1000,
      maximumDiscount: 1000,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'FLAT500',
      discountType: 'flat',
      discountValue: 500,
      minimumOrderAmount: 5000,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seed complete:');
  console.log(`  Admin login -> email: ${admin.email}  password: ${process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'}`);
  console.log(`  Customer login -> email: ${customers[0].email}  password: Password123`);
  console.log(`  Categories: ${categories.length}, Products: ${products.length}`);
  console.log('  Coupons: WELCOME10, FLAT500');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
