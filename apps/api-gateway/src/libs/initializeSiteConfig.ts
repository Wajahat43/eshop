import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const siteConfig = await prisma.site_config.findFirst();

    if (!siteConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            'Electronics',
            'Clothing',
            'Home & Garden',
            'Toys & Games',
            'Sports & Outdoors',
            'Health & Beauty',
          ],
          subCategories: {
            Electronics: ['Smartphones', 'Laptops', 'Tablets', 'TVs', 'Audio'],
            Clothing: ["Men's Clothing", "Women's Clothing", "Children's Clothing", 'Shoes', 'Accessories'],
            'Home & Garden': ['Furniture', 'Home Decor', 'Kitchen & Dining', 'Lawn & Garden'],
            'Toys & Games': ['Action Figures', 'Board Games', 'Dolls & Accessories', 'Puzzles', 'Building Blocks'],
            'Sports & Outdoors': ['Bikes', 'Fitness Equipment', 'Outdoor Gear', 'Sports Equipment'],
            'Health & Beauty': ['Skin Care', 'Hair Care', 'Makeup', 'Health & Wellness'],
          },
        },
      });
    }

    
  } catch (error) {
    console.error('Error initializing site config:', error);
    throw error;
  }
};

export default initializeSiteConfig;
