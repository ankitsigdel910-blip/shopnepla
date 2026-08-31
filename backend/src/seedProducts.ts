import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Product from './models/Product';
import Category from './models/Category';

dotenv.config();

/*
 * ============================================================
 * PRODUCT DATA
 *
 * Exactly 7 products for each of your 7 categories.
 * Total = 49 products.
 * ============================================================
 */

const productData = [
  // =========================================================
  // BEAUTY & PERSONAL CARE
  // =========================================================

  {
    category: 'Beauty & Personal Care',
    name: 'Vitamin C Face Serum',
    description:
      'Lightweight vitamin C facial serum for daily skin care and hydration.',
    price: 1299,
    discountPrice: 1099,
    brand: 'GlowCare',
    stock: 25,
    sku: 'BEAUTY-001',
    isFeatured: true,
  },

  {
    category: 'Beauty & Personal Care',
    name: 'Daily Moisturizing Cream',
    description:
      'Daily moisturizing face cream designed to keep skin soft and hydrated.',
    price: 899,
    discountPrice: 749,
    brand: 'PureSkin',
    stock: 30,
    sku: 'BEAUTY-002',
    isFeatured: false,
  },

  {
    category: 'Beauty & Personal Care',
    name: 'Aloe Vera Face Wash',
    description:
      'Refreshing aloe vera face wash for gentle everyday cleansing.',
    price: 499,
    discountPrice: 449,
    brand: 'NatureGlow',
    stock: 35,
    sku: 'BEAUTY-003',
    isFeatured: false,
  },

  {
    category: 'Beauty & Personal Care',
    name: 'SPF 50 Sunscreen',
    description:
      'Lightweight SPF 50 sunscreen for everyday protection from sunlight.',
    price: 999,
    discountPrice: 849,
    brand: 'SunCare',
    stock: 22,
    sku: 'BEAUTY-004',
    isFeatured: true,
  },

  {
    category: 'Beauty & Personal Care',
    name: 'Nourishing Hair Oil',
    description:
      'Nourishing hair oil suitable for regular scalp and hair care.',
    price: 650,
    brand: 'HerbalCare',
    stock: 28,
    sku: 'BEAUTY-005',
    isFeatured: false,
  },

  {
    category: 'Beauty & Personal Care',
    name: 'Hydrating Body Lotion',
    description:
      'Moisturizing body lotion with a smooth non-sticky texture.',
    price: 799,
    discountPrice: 699,
    brand: 'SoftTouch',
    stock: 24,
    sku: 'BEAUTY-006',
    isFeatured: false,
  },

  {
    category: 'Beauty & Personal Care',
    name: 'Refreshing Body Spray',
    description:
      'Everyday body spray with a fresh and long-lasting fragrance.',
    price: 599,
    brand: 'FreshAura',
    stock: 32,
    sku: 'BEAUTY-007',
    isFeatured: false,
  },

  // =========================================================
  // BOOKS & STATIONERY
  // =========================================================

  {
    category: 'Books & Stationery',
    name: 'Premium A5 Notebook',
    description:
      'Hardcover A5 notebook suitable for study, work and personal notes.',
    price: 350,
    brand: 'NotePro',
    stock: 50,
    sku: 'BOOK-001',
    isFeatured: true,
  },

  {
    category: 'Books & Stationery',
    name: 'Gel Pen Set',
    description:
      'Smooth writing gel pen set for school, college and office use.',
    price: 299,
    discountPrice: 249,
    brand: 'WriteWell',
    stock: 60,
    sku: 'BOOK-002',
    isFeatured: false,
  },

  {
    category: 'Books & Stationery',
    name: 'Scientific Calculator',
    description:
      'Scientific calculator for school, college and engineering calculations.',
    price: 1499,
    discountPrice: 1299,
    brand: 'CalcPro',
    stock: 20,
    sku: 'BOOK-003',
    isFeatured: true,
  },

  {
    category: 'Books & Stationery',
    name: 'Desk Organizer',
    description:
      'Compact desk organizer for pens, pencils and stationery accessories.',
    price: 699,
    brand: 'DeskMate',
    stock: 25,
    sku: 'BOOK-004',
    isFeatured: false,
  },

  {
    category: 'Books & Stationery',
    name: 'Highlighter Pack',
    description:
      'Bright highlighter set suitable for notes, study and office documents.',
    price: 249,
    brand: 'ColorMark',
    stock: 45,
    sku: 'BOOK-005',
    isFeatured: false,
  },

  {
    category: 'Books & Stationery',
    name: 'Drawing Sketchbook',
    description:
      'Quality sketchbook for drawing, artwork and creative practice.',
    price: 499,
    discountPrice: 449,
    brand: 'ArtLine',
    stock: 30,
    sku: 'BOOK-006',
    isFeatured: false,
  },

  {
    category: 'Books & Stationery',
    name: 'Sticky Notes Pack',
    description:
      'Multicolor sticky notes for reminders, bookmarks and organization.',
    price: 199,
    brand: 'MemoPlus',
    stock: 70,
    sku: 'BOOK-007',
    isFeatured: false,
  },

  // =========================================================
  // ELECTRONICS
  // =========================================================

  {
    category: 'Electronics',
    name: 'Aurora X12 Smartphone',
    description:
      'Modern smartphone with a bright display, fast processor and quality camera.',
    price: 41999,
    discountPrice: 39999,
    brand: 'Aurora',
    stock: 20,
    sku: 'ELEC-PHN-001',
    isFeatured: true,
  },

  {
    category: 'Electronics',
    name: 'Wireless Bluetooth Earbuds',
    description:
      'Compact wireless earbuds with charging case and clear audio.',
    price: 3499,
    discountPrice: 2999,
    brand: 'Sonic',
    stock: 35,
    sku: 'ELEC-002',
    isFeatured: true,
  },

  {
    category: 'Electronics',
    name: 'Smart Fitness Watch',
    description:
      'Smart watch with activity tracking, notifications and heart-rate monitoring.',
    price: 5999,
    discountPrice: 4999,
    brand: 'FitTime',
    stock: 25,
    sku: 'ELEC-003',
    isFeatured: true,
  },

  {
    category: 'Electronics',
    name: '10000mAh Power Bank',
    description:
      'Portable power bank for charging compatible phones and electronic devices.',
    price: 2499,
    discountPrice: 2199,
    brand: 'PowerGo',
    stock: 40,
    sku: 'ELEC-004',
    isFeatured: false,
  },

  {
    category: 'Electronics',
    name: 'Portable Bluetooth Speaker',
    description:
      'Portable wireless speaker with Bluetooth connectivity and clear sound.',
    price: 2999,
    brand: 'SoundBox',
    stock: 30,
    sku: 'ELEC-005',
    isFeatured: false,
  },

  {
    category: 'Electronics',
    name: 'Wireless Computer Mouse',
    description:
      'Comfortable wireless optical mouse for laptops and desktop computers.',
    price: 1299,
    brand: 'TechPoint',
    stock: 45,
    sku: 'ELEC-006',
    isFeatured: false,
  },

  {
    category: 'Electronics',
    name: 'USB-C Fast Charger',
    description:
      'Fast USB-C wall charger for compatible smartphones and devices.',
    price: 1799,
    discountPrice: 1499,
    brand: 'VoltPlus',
    stock: 38,
    sku: 'ELEC-007',
    isFeatured: false,
  },

  // =========================================================
  // FASHION
  // =========================================================

  {
    category: 'Fashion',
    name: 'Classic Cotton T-Shirt',
    description:
      'Comfortable everyday cotton T-shirt with a clean casual design.',
    price: 999,
    discountPrice: 799,
    brand: 'UrbanWear',
    stock: 50,
    sku: 'FASH-001',
    isFeatured: true,
  },

  {
    category: 'Fashion',
    name: 'Slim Fit Denim Jeans',
    description:
      'Slim fit denim jeans designed for comfortable everyday casual wear.',
    price: 2499,
    discountPrice: 2199,
    brand: 'DenimCo',
    stock: 35,
    sku: 'FASH-002',
    isFeatured: true,
  },

  {
    category: 'Fashion',
    name: 'Casual Hoodie',
    description:
      'Soft casual hoodie suitable for cool weather and everyday use.',
    price: 2199,
    brand: 'StreetStyle',
    stock: 30,
    sku: 'FASH-003',
    isFeatured: false,
  },

  {
    category: 'Fashion',
    name: 'Everyday Sneakers',
    description:
      'Comfortable sneakers designed for daily walking and casual outfits.',
    price: 3499,
    discountPrice: 2999,
    brand: 'StepUp',
    stock: 28,
    sku: 'FASH-004',
    isFeatured: true,
  },

  {
    category: 'Fashion',
    name: 'Leather Style Wallet',
    description:
      'Compact wallet with multiple card slots and cash compartment.',
    price: 1299,
    brand: 'UrbanLeather',
    stock: 40,
    sku: 'FASH-005',
    isFeatured: false,
  },

  {
    category: 'Fashion',
    name: 'Casual Backpack',
    description:
      'Everyday backpack with spacious storage for school, work and travel.',
    price: 1999,
    discountPrice: 1699,
    brand: 'CarryPro',
    stock: 32,
    sku: 'FASH-006',
    isFeatured: false,
  },

  {
    category: 'Fashion',
    name: 'Classic Sunglasses',
    description:
      'Stylish sunglasses designed for everyday outdoor use.',
    price: 1499,
    brand: 'SunStyle',
    stock: 36,
    sku: 'FASH-007',
    isFeatured: false,
  },

  // =========================================================
  // GROCERIES & FOOD
  // =========================================================

  {
    category: 'Groceries & Food',
    name: 'Premium Basmati Rice 5kg',
    description:
      'Long-grain basmati rice suitable for everyday meals and special dishes.',
    price: 1299,
    brand: 'FreshHarvest',
    stock: 40,
    sku: 'FOOD-001',
    isFeatured: true,
  },

  {
    category: 'Groceries & Food',
    name: 'Pure Mustard Oil 1L',
    description:
      'Mustard cooking oil packed for regular household kitchen use.',
    price: 450,
    brand: 'HealthyKitchen',
    stock: 50,
    sku: 'FOOD-002',
    isFeatured: false,
  },

  {
    category: 'Groceries & Food',
    name: 'Organic Honey 500g',
    description:
      'Natural honey suitable for breakfast, drinks and everyday use.',
    price: 799,
    discountPrice: 699,
    brand: 'NatureFarm',
    stock: 30,
    sku: 'FOOD-003',
    isFeatured: true,
  },

  {
    category: 'Groceries & Food',
    name: 'Premium Tea 500g',
    description:
      'Aromatic tea leaves for preparing refreshing hot tea at home.',
    price: 599,
    brand: 'HimalayanTea',
    stock: 45,
    sku: 'FOOD-004',
    isFeatured: false,
  },

  {
    category: 'Groceries & Food',
    name: 'Mixed Dry Fruits 500g',
    description:
      'Convenient mixed dry fruits pack suitable for snacks and sharing.',
    price: 1199,
    discountPrice: 999,
    brand: 'NutHouse',
    stock: 25,
    sku: 'FOOD-005',
    isFeatured: true,
  },

  {
    category: 'Groceries & Food',
    name: 'Instant Coffee 200g',
    description:
      'Instant coffee for preparing quick hot or cold coffee beverages.',
    price: 699,
    brand: 'CoffeeDay',
    stock: 35,
    sku: 'FOOD-006',
    isFeatured: false,
  },

  {
    category: 'Groceries & Food',
    name: 'Whole Wheat Flour 5kg',
    description:
      'Whole wheat flour packaged for everyday home cooking and baking.',
    price: 599,
    brand: 'FreshMill',
    stock: 48,
    sku: 'FOOD-007',
    isFeatured: false,
  },

  // =========================================================
  // HOME & KITCHEN
  // =========================================================

  {
    category: 'Home & Kitchen',
    name: 'Non-Stick Frying Pan',
    description:
      'Non-stick frying pan suitable for everyday home cooking.',
    price: 1799,
    discountPrice: 1499,
    brand: 'CookPro',
    stock: 30,
    sku: 'HOME-001',
    isFeatured: true,
  },

  {
    category: 'Home & Kitchen',
    name: 'Electric Kettle 1.8L',
    description:
      'Electric kettle for quickly boiling water for tea, coffee and meals.',
    price: 1999,
    discountPrice: 1699,
    brand: 'HomeHeat',
    stock: 25,
    sku: 'HOME-002',
    isFeatured: true,
  },

  {
    category: 'Home & Kitchen',
    name: 'Stainless Steel Bottle',
    description:
      'Reusable stainless steel water bottle for home, work and travel.',
    price: 999,
    brand: 'HydroHome',
    stock: 40,
    sku: 'HOME-003',
    isFeatured: false,
  },

  {
    category: 'Home & Kitchen',
    name: 'Kitchen Knife Set',
    description:
      'Multipurpose kitchen knife set for common food preparation tasks.',
    price: 1499,
    brand: 'ChefMate',
    stock: 28,
    sku: 'HOME-004',
    isFeatured: false,
  },

  {
    category: 'Home & Kitchen',
    name: 'Food Storage Container Set',
    description:
      'Reusable food storage containers for keeping kitchen ingredients organized.',
    price: 1299,
    discountPrice: 1099,
    brand: 'StoreFresh',
    stock: 35,
    sku: 'HOME-005',
    isFeatured: false,
  },

  {
    category: 'Home & Kitchen',
    name: 'Digital Kitchen Scale',
    description:
      'Compact digital kitchen scale for measuring cooking and baking ingredients.',
    price: 1399,
    brand: 'KitchenTech',
    stock: 20,
    sku: 'HOME-006',
    isFeatured: false,
  },

  {
    category: 'Home & Kitchen',
    name: 'Ceramic Coffee Mug Set',
    description:
      'Ceramic mug set suitable for tea, coffee and other hot beverages.',
    price: 899,
    brand: 'HomeStyle',
    stock: 32,
    sku: 'HOME-007',
    isFeatured: false,
  },

  // =========================================================
  // SPORTS & FITNESS
  // =========================================================

  {
    category: 'Sports & Fitness',
    name: 'Yoga Exercise Mat',
    description:
      'Comfortable exercise mat for yoga, stretching and home workouts.',
    price: 1499,
    discountPrice: 1299,
    brand: 'FitLife',
    stock: 35,
    sku: 'SPORT-001',
    isFeatured: true,
  },

  {
    category: 'Sports & Fitness',
    name: 'Adjustable Dumbbell Set',
    description:
      'Adjustable dumbbell set suitable for strength training at home.',
    price: 4999,
    discountPrice: 4499,
    brand: 'PowerFit',
    stock: 18,
    sku: 'SPORT-002',
    isFeatured: true,
  },

  {
    category: 'Sports & Fitness',
    name: 'Skipping Rope',
    description:
      'Lightweight skipping rope suitable for cardio and fitness training.',
    price: 599,
    brand: 'ActivePro',
    stock: 50,
    sku: 'SPORT-003',
    isFeatured: false,
  },

  {
    category: 'Sports & Fitness',
    name: 'Resistance Band Set',
    description:
      'Resistance bands for strength, mobility and home workout exercises.',
    price: 1199,
    discountPrice: 999,
    brand: 'FlexFit',
    stock: 40,
    sku: 'SPORT-004',
    isFeatured: true,
  },

  {
    category: 'Sports & Fitness',
    name: 'Sports Water Bottle',
    description:
      'Reusable sports water bottle for gym, walking and outdoor activities.',
    price: 799,
    brand: 'HydroFit',
    stock: 45,
    sku: 'SPORT-005',
    isFeatured: false,
  },

  {
    category: 'Sports & Fitness',
    name: 'Gym Training Gloves',
    description:
      'Training gloves designed to improve grip during gym workouts.',
    price: 999,
    brand: 'GripPro',
    stock: 30,
    sku: 'SPORT-006',
    isFeatured: false,
  },

  {
    category: 'Sports & Fitness',
    name: 'Foam Roller',
    description:
      'Foam roller for stretching and post-workout muscle recovery routines.',
    price: 1299,
    brand: 'RecoverFit',
    stock: 25,
    sku: 'SPORT-007',
    isFeatured: false,
  },
];

/*
 * ============================================================
 * SEED FUNCTION
 * ============================================================
 */

const seedProducts =
  async () => {
    try {
      if (
        !process.env
          .MONGODB_URI
      ) {
        throw new Error(
          'MONGODB_URI is missing from backend/.env'
        );
      }

      console.log(
        'Connecting to MongoDB...'
      );

      await mongoose.connect(
        process.env.MONGODB_URI
      );

      console.log(
        'MongoDB connected.'
      );

      /*
       * Get your existing categories.
       */
      const categories =
        await Category.find({
          isActive: true,
        });

      console.log(
        `Found ${categories.length} active categories.`
      );

      /*
       * Map category name -> category document.
       */
      const categoryMap =
        new Map(
          categories.map(
            (category) => [
              category.name,
              category,
            ]
          )
        );

      /*
       * Make sure all 7 required
       * categories exist.
       */
      const requiredCategories =
        [
          'Beauty & Personal Care',
          'Books & Stationery',
          'Electronics',
          'Fashion',
          'Groceries & Food',
          'Home & Kitchen',
          'Sports & Fitness',
        ];

      for (
        const categoryName
        of requiredCategories
      ) {
        if (
          !categoryMap.has(
            categoryName
          )
        ) {
          throw new Error(
            `Category not found: "${categoryName}". Check the category name in MongoDB/admin.`
          );
        }
      }

      let created = 0;
      let skipped = 0;

      /*
       * Insert products one at a time.
       *
       * Existing SKU = skip it.
       * This makes the script safe to
       * run again accidentally.
       */
      for (
        const data
        of productData
      ) {
        const existing =
          await Product.findOne({
            sku: data.sku,
          });

        if (existing) {
          console.log(
            `SKIP: ${data.sku} - ${data.name}`
          );

          skipped++;

          continue;
        }

        const category =
          categoryMap.get(
            data.category
          );

        if (!category) {
          console.log(
            `SKIP: category missing for ${data.name}`
          );

          skipped++;

          continue;
        }

        await Product.create(
          {
            name: data.name,

            description:
              data.description,

            price:
              data.price,

            discountPrice:
              data.discountPrice,

            /*
             * IMPORTANT:
             * Use the actual MongoDB
             * category ObjectId.
             */
            category:
              category._id,

            brand:
              data.brand,

            stock:
              data.stock,

            sku:
              data.sku,

            isFeatured:
              data.isFeatured,

            isActive: true,

            /*
             * Seed products start
             * without images.
             *
             * You can upload images
             * from the admin edit form.
             */
            images: [],
          }
        );

        console.log(
          `CREATED: ${data.sku} - ${data.name}`
        );

        created++;
      }

      console.log(
        '\n=============================='
      );

      console.log(
        'PRODUCT SEED COMPLETE'
      );

      console.log(
        `Created: ${created}`
      );

      console.log(
        `Skipped: ${skipped}`
      );

      console.log(
        `Total definitions: ${productData.length}`
      );

      console.log(
        '=============================='
      );
    } catch (error) {
      console.error(
        'Product seed failed:',
        error
      );
    } finally {
      await mongoose.disconnect();

      console.log(
        'MongoDB disconnected.'
      );
    }
  };

seedProducts();