// Prisma Relationships - Practical Examples
// This file shows how to use the relationships defined in your schema

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example 1: One-to-One Relationship (User ↔ Avatar)
async function createUserWithAvatar() {
  // Create a user first
  const user = await prisma.users.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
    },
  });

  // Create an avatar image for the user
  const avatar = await prisma.images.create({
    data: {
      file_id: 'file123',
      url: 'https://example.com/avatar.jpg',
      userId: user.id, // Link to the user
    },
  });

  // Query user with their avatar
  const userWithAvatar = await prisma.users.findUnique({
    where: { id: user.id },
    include: { avatar: true },
  });

  console.log('User with avatar:', userWithAvatar);
  // Output: { id: "...", name: "John Doe", avatar: { id: "...", url: "..." } }
}

// Example 2: One-to-Many Relationship (User → Reviews)
async function createUserWithReviews() {
  // Create a user
  const user = await prisma.users.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'hashedPassword',
    },
  });

  // Create multiple reviews for the user
  const reviews = await Promise.all([
    prisma.shopReview.create({
      data: {
        userId: user.id,
        rating: 4.5,
        reviews: 'Great shop!',
      },
    }),
    prisma.shopReview.create({
      data: {
        userId: user.id,
        rating: 3.8,
        reviews: 'Good experience',
      },
    }),
  ]);

  // Query user with all their reviews
  const userWithReviews = await prisma.users.findUnique({
    where: { id: user.id },
    include: { reviews: true },
  });

  console.log('User with reviews:', userWithReviews);
  // Output: { id: "...", name: "Jane Smith", reviews: [{ rating: 4.5, ... }, { rating: 3.8, ... }] }
}

// Example 3: Bidirectional One-to-One (Seller ↔ Shop)
async function createSellerWithShop() {
  // Create a seller
  const seller = await prisma.sellers.create({
    data: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone_number: '+1234567890',
      country: 'USA',
    },
  });

  // Create a shop for the seller
  const shop = await prisma.shops.create({
    data: {
      name: "Mike's Electronics",
      category: 'Electronics',
      address: '123 Main St',
      sellerId: seller.id, // Link to seller
    },
  });

  // Query seller with their shop
  const sellerWithShop = await prisma.sellers.findUnique({
    where: { id: seller.id },
    include: { shop: true },
  });

  // Query shop with their seller
  const shopWithSeller = await prisma.shops.findUnique({
    where: { id: shop.id },
    include: { sellers: true },
  });

  console.log('Seller with shop:', sellerWithShop);
  console.log('Shop with seller:', shopWithSeller);
}

// Example 4: Complex Query with Multiple Relations
async function getShopWithAllDetails() {
  const shopWithDetails = await prisma.shops.findUnique({
    where: { id: 'some-shop-id' },
    include: {
      sellers: true, // Shop owner
      avatar: true, // Shop avatar image
      reviews: {
        // All reviews
        include: {
          user: true, // User who wrote each review
        },
      },
    },
  });

  console.log('Shop with all details:', shopWithDetails);
  // Output: Complete shop data with seller, avatar, and reviews with user details
}

// Example 5: Polymorphic Image Relations
async function createImagesForDifferentEntities() {
  // Create a user avatar
  const userAvatar = await prisma.images.create({
    data: {
      file_id: 'avatar123',
      url: 'https://example.com/user-avatar.jpg',
      userId: 'user-id-here', // Belongs to user
    },
  });

  // Create a shop avatar
  const shopAvatar = await prisma.images.create({
    data: {
      file_id: 'shop123',
      url: 'https://example.com/shop-avatar.jpg',
      shopId: 'shop-id-here', // Belongs to shop
    },
  });

  // Query images with their relations
  const imagesWithRelations = await prisma.images.findMany({
    include: {
      users: true, // Will be null for shop images
      shops: true, // Will be null for user images
    },
  });

  console.log('Images with relations:', imagesWithRelations);
}

// Example 6: Filtering by Relations
async function findShopsWithHighRatings() {
  const highRatedShops = await prisma.shops.findMany({
    where: {
      ratings: {
        gte: 4.0, // Greater than or equal to 4.0
      },
    },
    include: {
      reviews: {
        where: {
          rating: {
            gte: 4.0,
          },
        },
      },
    },
  });

  console.log('High-rated shops:', highRatedShops);
}

// Example 7: Creating Related Data in One Transaction
async function createCompleteShopSetup() {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create seller
    const seller = await tx.sellers.create({
      data: {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone_number: '+1987654321',
        country: 'Canada',
      },
    });

    // 2. Create shop avatar
    const shopAvatar = await tx.images.create({
      data: {
        file_id: 'shop-avatar-456',
        url: 'https://example.com/shop-avatar.jpg',
        shopId: null, // Will be updated after shop creation
      },
    });

    // 3. Create shop
    const shop = await tx.shops.create({
      data: {
        name: "Sarah's Boutique",
        category: 'Fashion',
        address: '456 Fashion Ave',
        sellerId: seller.id,
        avatar: {
          connect: { id: shopAvatar.id }, // Connect existing image
        },
      },
    });

    // 4. Update the image with shop ID
    await tx.images.update({
      where: { id: shopAvatar.id },
      data: { shopId: shop.id },
    });

    return { seller, shop, shopAvatar };
  });

  console.log('Complete shop setup:', result);
}

// Example 8: Updating Relations
async function updateUserAvatar() {
  // Create new avatar
  const newAvatar = await prisma.images.create({
    data: {
      file_id: 'new-avatar-789',
      url: 'https://example.com/new-avatar.jpg',
    },
  });

  // Update user to use new avatar
  const updatedUser = await prisma.users.update({
    where: { id: 'user-id-here' },
    data: {
      avatar: {
        connect: { id: newAvatar.id },
      },
    },
    include: { avatar: true },
  });

  console.log('Updated user with new avatar:', updatedUser);
}

// Example 9: Deleting with Relations
async function deleteShopWithCascade() {
  // Note: You'll need to handle cascading deletes manually in Prisma
  // or set up database-level cascading

  const shop = await prisma.shops.findUnique({
    where: { id: 'shop-id-here' },
    include: {
      avatar: true,
      reviews: true,
    },
  });

  if (shop) {
    // Delete related data first
    if (shop.avatar) {
      await prisma.images.delete({
        where: { id: shop.avatar.id },
      });
    }

    // Delete reviews
    await prisma.shopReview.deleteMany({
      where: { shopsId: shop.id },
    });

    // Finally delete the shop
    await prisma.shops.delete({
      where: { id: shop.id },
    });
  }
}

// Example 10: Aggregating Related Data
async function getShopStatistics() {
  const shopStats = await prisma.shops.findMany({
    include: {
      _count: {
        select: {
          reviews: true, // Count of reviews
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  // Calculate average rating for each shop
  const shopsWithAvgRating = shopStats.map((shop) => {
    const avgRating =
      shop.reviews.length > 0 ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length : 0;

    return {
      id: shop.id,
      name: shop.name,
      reviewCount: shop._count.reviews,
      averageRating: avgRating,
    };
  });

  console.log('Shop statistics:', shopsWithAvgRating);
}

export {
  createUserWithAvatar,
  createUserWithReviews,
  createSellerWithShop,
  getShopWithAllDetails,
  createImagesForDifferentEntities,
  findShopsWithHighRatings,
  createCompleteShopSetup,
  updateUserAvatar,
  deleteShopWithCascade,
  getShopStatistics,
};
