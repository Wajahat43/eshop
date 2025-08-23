import { AuthError, ValidationError } from '@packages/error-handler';
import imageKit from '@packages/libs/imageKit';
import prisma from '@packages/libs/prisma';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

//Get product categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }
    res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return next(error);
  }
};

//Create Discount Codes
export const createDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isCodeExists = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isCodeExists) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    const newDiscountCode = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      message: 'Discount code created successfully',
      discountCode: newDiscountCode,
    });
  } catch (error) {
    console.error('Error creating discount codes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Get discount codes
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {
    const discountCodes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    res.status(200).json({
      message: 'Discount codes fetched successfully',
      discountCodes,
    });
  } catch (error) {
    console.error('Error getting discount codes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Delete discount code
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const doesCodeBelongToSeller = await prisma.discount_codes.findUnique({
      where: {
        id,
        sellerId,
      },
    });

    if (!doesCodeBelongToSeller) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.discount_codes.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: 'Discount code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//upload Product Image
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.body;

    const response = await imageKit.upload({
      file: filename,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res.status(200).json({
      message: 'Product image uploaded successfully',
      fileUrl: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

//Delete Product Image
export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.body;
    const response = await imageKit.deleteFile(fileId);
    res.status(201).json({ success: true, response });
  } catch (error) {
    console.error('Error deleting product image:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties,
      images = [],
      starting_date,
      ending_date,
    } = req.body;

    const requiredFields = [
      'title',
      'slug',
      'description',
      'category',
      'subCategory',
      'sale_price',
      'images',
      'tags',
      'stock',
      'regular_price',
      'warranty',
      'cash_on_delivery',
      'brand',
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ message: `All fields are required. Following fields are missing: ${missingFields.join(', ')}` });
    }

    if (!req.seller?.id) {
      return next(new AuthError('Only Sellers can create products'));
    }

    const isSlugUsed = await prisma.products.findUnique({ where: { slug } });
    if (isSlugUsed) {
      next(new ValidationError('Slug is already used. Please try a different slug'));
    }

    // If dates are provided, validate they are both present and start < end
    if ((starting_date && !ending_date) || (!starting_date && ending_date)) {
      return res.status(400).json({ message: 'Both starting_date and ending_date are required for events' });
    }
    if (starting_date && ending_date) {
      const start = new Date(starting_date);
      const end = new Date(ending_date);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid event dates' });
      }
      if (end <= start) {
        return res.status(400).json({ message: 'ending_date must be after starting_date' });
      }
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description: description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id || '',
        tags: Array.isArray(tags) ? tags : tags.split(','),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes?.map((codeId: string) => codeId) || [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_specifications: custom_specifications || {},
        custom_properties: customProperties || {},
        status: 'ACTIVE',
        starting_date: starting_date ? new Date(starting_date) : undefined,
        ending_date: ending_date ? new Date(ending_date) : undefined,
        images: {
          create:
            images
              .filter((image: any) => image && image.fileUrl && image.fileId)
              .map((image: any) => ({ url: image.fileUrl, file_id: image.fileId })) || [],
        },
      },
      include: { images: true },
    });

    res.status(201).json({ success: true, newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Get all products
export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req.seller?.shop?.id || '',
      },
      include: {
        images: true,
      },
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error getting shop products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Delete Product
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const shopId = req.seller?.shop?.id;

    //Check if product belongs to seller
    const product = await prisma.products.findUnique({ where: { id, shopId: shopId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.isDeleted) {
      return res.status(400).json({ message: 'Product already deleted' });
    }

    await prisma.products.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
    });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const shopId = req.seller?.shop?.id;

    //Check if product belongs to seller
    const product = await prisma.products.findUnique({ where: { id, shopId: shopId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!product.isDeleted) {
      return res.status(400).json({ message: 'Product is not deleted' });
    }

    await prisma.products.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
    res.status(200).json({ success: true, message: 'Product restored successfully' });
  } catch (error) {
    console.error('Error restoring product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Get all products
export const getAllProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    // Base filter - always include these
    const baseFilter = {
      isDeleted: false, // Only show non-deleted products
      status: 'ACTIVE' as const, // Only show active products
      OR: [{ starting_date: null }, { starting_date: { isSet: false } }],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === 'latest' ? { createdAt: 'desc' as Prisma.SortOrder } : { createdAt: 'desc' as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        orderBy,
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);

    res.status(200).json({
      success: true,
      top10By: type === 'latest' ? 'latest' : 'topSales',
      products,
      total,
      top10Products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

//Get all events (products with starting_date and ending_date)
export const getAllEvents = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Filter for events - products with starting_date
    const eventFilter = {
      isDeleted: false, // Only show non-deleted events
      status: 'ACTIVE' as const, // Only show active events
      starting_date: {
        not: null,
        isSet: true,
      },
    };

    const [events, total] = await Promise.all([
      prisma.products.findMany({
        where: eventFilter,
        orderBy: {
          starting_date: 'asc' as Prisma.SortOrder, // Order by upcoming events first
        },
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: eventFilter }),
    ]);

    res.status(200).json({
      success: true,
      events,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

//Get Product details
export const getProductDetails = async (req: any, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug: req.params.slug,
      },
      include: {
        images: true,
        shop: true,
      },
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log('Error in product', error);
    return next(error);
  }
};

//Get filtered products
export const getFilteredProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { priceRange = '0-1000000', categories = '', colors = '', sizes = '', page = '1', limit = '12' } = req.query;

    // Parse price range
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);

    // Parse page and limit
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    // Calculate products to skip
    const skip = (parsedPage - 1) * parsedLimit;

    // Create base filters object - always include these

    const filters: any = {
      isDeleted: false, // Only show non-deleted products
      status: 'ACTIVE' as const, // Only show active products
      OR: [{ starting_date: null }, { starting_date: { isSet: false } }], // Only show products without start dates (regular products, not events)
      sale_price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    // Add category filter if provided
    if (categories) {
      const categoryList = categories.split(',').map((cat: string) => cat.trim());
      // Use case-insensitive comparison with regex
      filters.category = {
        mode: 'insensitive',
        in: categoryList,
      };
    }

    // Add colors filter if provided
    if (colors) {
      const colorList = colors.split(',').map((color: string) => color.trim());
      // Use case-insensitive comparison for colors
      filters.colors = {
        hasSome: colorList.map((color: string) => ({
          mode: 'insensitive' as const,
          equals: color,
        })),
      };
    }

    // Add sizes filter if provided
    if (sizes) {
      const sizeList = sizes.split(',').map((size: string) => size.trim());
      // Use case-insensitive comparison for sizes
      filters.sizes = {
        hasSome: sizeList.map((size: string) => ({
          mode: 'insensitive' as const,
          equals: size,
        })),
      };
    }

    // Fetch products and total from prisma
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / parsedLimit);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error getting filtered products:', error);
    return next(error);
  }
};

//Get filtered events (products with dates)
export const getFilteredEvents = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { priceRange = '0-1000000', categories = '', colors = '', sizes = '', page = '1', limit = '12' } = req.query;

    // Parse price range
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);

    // Parse page and limit
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    // Calculate products to skip
    const skip = (parsedPage - 1) * parsedLimit;

    // Create filters object for events (products with dates)
    const filters: any = {
      isDeleted: false, // Only show non-deleted events
      status: 'ACTIVE' as const, // Only show active events
      sale_price: {
        gte: minPrice,
        lte: maxPrice,
      },
      starting_date: {
        not: null,
        isSet: true,
      },
    };

    // Add category filter if provided
    if (categories) {
      const categoryList = categories.split(',').map((cat: string) => cat.trim());
      filters.category = { in: categoryList };
    }

    // Add colors filter if provided
    if (colors) {
      const colorList = colors.split(',').map((color: string) => color.trim());
      filters.colors = { hasSome: colorList };
    }

    // Add sizes filter if provided
    if (sizes) {
      const sizeList = sizes.split(',').map((size: string) => size.trim());
      filters.sizes = { hasSome: sizeList };
    }

    // Fetch events and total from prisma
    const [events, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
        orderBy: {
          starting_date: 'asc',
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / parsedLimit);

    res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error getting filtered events:', error);
    return next(error);
  }
};

//Get filtered shops
export const getFilteredShops = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { categories = '', countries = '', page = '1', limit = '12' } = req.query;

    // Parse page and limit
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    // Calculate shops to skip
    const skip = (parsedPage - 1) * parsedLimit;

    // Create filters object
    const filters: any = {};

    // Add category filter if provided
    if (categories) {
      const categoryList = categories.split(',').map((cat: string) => cat.trim());
      filters.category = { in: categoryList };
    }

    // Add country filter if provided
    if (countries) {
      const countryList = countries.split(',').map((country: string) => country.trim());
      filters.country = { in: countryList };
    }

    // Fetch shops and total from prisma
    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          products: {
            where: {
              isDeleted: false,
            },
            include: {
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / parsedLimit);

    res.status(200).json({
      success: true,
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error getting filtered shops:', error);
    return next(error);
  }
};

//Search products
export const searchProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            short_description: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return next(error);
  }
};

//Get top shops based on product analytics
export const getTopShops = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Get top shops based on total product views and purchases
    // const topShops = await prisma.orders.groupBy({
    //   by: ['shopId'],
    //   _sum: {
    //     total: true,
    //   },
    //   orderBy: {
    //     _sum: {
    //       views: 'desc',
    //     },
    //   },
    //   take: 10,
    // });

    const topShops = [] as any;

    // Get shop details for the top shops
    const shopIds = topShops.map((shop: any) => shop.shopId);
    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        category: true,
      },
    });

    // Combine analytics with shop details
    const topShopsWithDetails = topShops.map((shopAnalytics: any) => {
      const shop = shops.find((s) => s.id === shopAnalytics.shopId);
      return {
        shop,
        totalSales: shopAnalytics._sum.total || 0,
      };
    });

    res.status(200).json({
      success: true,
      topShops: topShopsWithDetails,
    });
  } catch (error) {
    console.error('Error getting top shops:', error);
    return next(error);
  }
};
