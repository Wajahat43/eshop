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

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description: description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
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
        shopId: req.seller?.shop?.id!,
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

    // const baseFilter = {
    //   OR: [
    //     {
    //       starting_date: null,
    //     },
    //     {
    //       ending_date: null,
    //     },
    //   ],
    // };
    const baseFilter = {};
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
