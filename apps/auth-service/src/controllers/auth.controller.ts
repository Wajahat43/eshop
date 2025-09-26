import { NextFunction, Request, Response } from 'express';

import { AuthError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import imageKit from '@packages/libs/imageKit';
import {
  checkOTPRestrictions,
  handleForgotPassword,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
  verifyForgotPasswordOTP,
  verifyOTP,
} from '../utils/auth.helper';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//Register a new user.
export const UserRegistration = async (request: Request, response: Response, next: NextFunction) => {
  try {
    validateRegistrationData(request.body, 'user');

    const { name, email } = request.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError('User has already signed up with this email.'));
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, 'user-activation-mail');

    response.status(200).json({
      message: 'OTP sent successfully! Please verify your account',
    });
  } catch (error) {
    next(error);
  }
};

//verify user
export const UserVerification = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name } = request.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError('Missing required fields!'));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AuthError('User has already signed up with this email.'));
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    response.status(200).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Login User
export const UserLogin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return next(new ValidationError('Missing required fields!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError('User not found!'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password ?? '');
    if (!isPasswordValid) {
      return next(new AuthError('Invalid password!'));
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '24h',
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      },
    );

    // store the tokens in httpOnly secure cookie
    setCookie(response, 'access_token', accessToken);
    setCookie(response, 'refresh_token', refreshToken);

    response.status(200).json({
      success: true,
      message: 'User logged in successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//Refresh Token User
export const RefreshToken = async (request: any, response: Response, next: NextFunction) => {
  try {
    const refreshToken = request.cookies['refresh_token'] || request.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new ValidationError('Unauthorized! No refresh token');
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as {
      id: string;
      role: string;
    };

    if (!decoded || !decoded.id || !decoded.role || decoded.role !== 'user') {
      return new JsonWebTokenError('Forbidden! Invalid refresh token');
    }

    const account = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!account) {
      return new AuthError('User not found!');
    }

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '24h',
      },
    );

    setCookie(response, 'access_token', accessToken);
    setCookie(response, 'refresh_token', refreshToken);

    request.role = decoded.role;
    response.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//Refresh Token Seller
export const RefreshSellerToken = async (request: any, response: Response, next: NextFunction) => {
  try {
    const refreshToken = request.cookies['seller_refresh_token'] || request.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new ValidationError('Unauthorized! No refresh token');
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as {
      id: string;
      role: string;
    };

    if (!decoded || !decoded.id || !decoded.role || decoded.role !== 'seller') {
      return new JsonWebTokenError('Forbidden! Invalid refresh token');
    }

    const account = await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } });

    if (!account) {
      return new AuthError('Seller not found!');
    }

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '72h',
      },
    );

    setCookie(response, 'seller_access_token', accessToken);
    setCookie(response, 'seller_refresh_token', refreshToken);

    request.role = decoded.role;
    response.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//Get logged in User
export const getUser = async (request: any, response: Response, next: NextFunction) => {
  try {
    const user = request.user;
    if (!user) {
      const seller = request.seller;
      if (!seller) {
        return next(new AuthError('User or seller not found!'));
      }

      return next(new AuthError('User not Signed In!'));
    }
    response.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};
//Forgot password
export const UserForgotPassword = async (request: Request, response: Response, next: NextFunction) => {
  await handleForgotPassword(request, response, next, 'user');
};

//Verify user forgot password otp
export const UserVerifyForgotPasswordOTP = async (request: Request, response: Response, next: NextFunction) => {
  await verifyForgotPasswordOTP(request, response, next);
};

//Reset User Password
export const UserResetPassword = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = request.body;
    if (!email || !otp || !newPassword) {
      return next(new ValidationError('Missing required fields!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError('User not found!'));
    }

    const isPasswordValid = await bcrypt.compare(newPassword, user.password ?? '');
    if (isPasswordValid) {
      return next(new ValidationError('New password cannot be the same as the old one!'));
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    response.status(200).json({
      success: true,
      message: 'Password reset successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Register a new seller
export const SellerRegistration = async (request: Request, response: Response, next: NextFunction) => {
  try {
    validateRegistrationData(request.body, 'seller');
    const { name, email } = request.body;

    const exsistingSeller = await prisma.sellers.findUnique({ where: { email } });
    if (exsistingSeller) {
      throw new ValidationError('Seller has already signed up with this email.');
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, 'seller-activation-mail');

    response.status(200).json({
      message: 'OTP sent successfully! Please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

//Verify Seller with OTP
export const verifySeller = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name, phone_number, country } = request.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError('Missing required fields!'));
    }

    const existingSeller = await prisma.sellers.findUnique({ where: { email } });
    if (existingSeller) {
      throw new ValidationError('Seller has already signed up with this email.');
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        country,
        shopId: null, // Explicitly set to null initially
      },
    });

    response.status(200).json({
      success: true,
      message: 'Seller registered successfully!',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone_number: seller.phone_number,
        country: seller.country,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//Login seller
export const sellerLogin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return next(new ValidationError('Missing required fields!'));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new AuthError('Seller not found!'));
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password ?? '');
    if (!isPasswordValid) {
      return next(new AuthError('Invalid password!'));
    }

    const accessToken = jwt.sign(
      {
        id: seller.id,
        role: 'seller',
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '72h' },
    );

    const refreshToken = jwt.sign(
      {
        id: seller.id,
        role: 'seller',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '30d' },
    );

    //Because we set same cookies for user and seller, only one type of account can be logged in at a time.
    //Therefore, we are setting it differently.
    setCookie(response, 'seller_access_token', accessToken);
    setCookie(response, 'seller_refresh_token', refreshToken);

    response.status(200).json({
      success: true,
      message: 'Seller logged in successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Get logged in seller
export const getSeller = async (request: any, response: Response, next: NextFunction) => {
  try {
    const seller = request.seller;
    if (!seller) {
      return next(new AuthError('Seller not found!'));
    }

    response.status(200).json({ seller });
  } catch (error) {
    return next(error);
  }
};

//Create a New Shop
export const createNewShop = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } = request.body;
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError('Missing required fields!'));
    }

    const shopData = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    } as any;

    if (website && website.trim()) {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    // Update the seller's shopId to link them
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { shopId: shop.id },
    });

    response.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

//Logout user
export const logoutUser = async (request: any, response: Response, next: NextFunction) => {
  try {
    // Clear all authentication cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    response.status(200).json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Logout seller
export const logoutSeller = async (request: any, response: Response, next: NextFunction) => {
  try {
    // Clear all authentication cookies
    response.clearCookie('seller_access_token');
    response.clearCookie('seller_refresh_token');

    response.status(200).json({
      success: true,
      message: 'Seller logged out successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Get user addresses
export const getUserAddresses = async (request: any, response: Response, next: NextFunction) => {
  try {
    const userId = request.user.id;

    const addresses = await prisma.userAddresses.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    response.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};

//Add new user address
export const addUserAddress = async (request: any, response: Response, next: NextFunction) => {
  try {
    const userId = request.user.id;
    const { label, name, street, city, zip, country, isDefault } = request.body;

    // Validate required fields
    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError('Missing required fields!'));
    }

    // If this is the default address, unset other default addresses
    if (isDefault) {
      await prisma.userAddresses.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddresses.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault: isDefault || false,
      },
    });

    response.status(201).json({
      success: true,
      message: 'Address added successfully!',
      address,
    });
  } catch (error) {
    return next(error);
  }
};

//Update user address
export const updateUserAddress = async (request: any, response: Response, next: NextFunction) => {
  try {
    const userId = request.user.id;
    const { id } = request.params;
    const { label, name, street, city, zip, country, isDefault } = request.body;

    // Validate required fields
    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError('Missing required fields!'));
    }

    // Check if address belongs to user
    const existingAddress = await prisma.userAddresses.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return next(new ValidationError('Address not found!'));
    }

    // If this is the default address, unset other default addresses
    if (isDefault) {
      await prisma.userAddresses.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddresses.update({
      where: { id },
      data: {
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault: isDefault || false,
      },
    });

    response.status(200).json({
      success: true,
      message: 'Address updated successfully!',
      address,
    });
  } catch (error) {
    return next(error);
  }
};

//Delete user address
export const deleteUserAddress = async (request: any, response: Response, next: NextFunction) => {
  try {
    const userId = request.user.id;
    const { id } = request.params;

    // Check if address belongs to user
    const existingAddress = await prisma.userAddresses.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return next(new ValidationError('Address not found!'));
    }

    await prisma.userAddresses.delete({
      where: { id },
    });

    response.status(200).json({
      success: true,
      message: 'Address deleted successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Set default address
export const setDefaultAddress = async (request: any, response: Response, next: NextFunction) => {
  try {
    const userId = request.user.id;
    const { id } = request.params;

    // Check if address belongs to user
    const existingAddress = await prisma.userAddresses.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return next(new ValidationError('Address not found!'));
    }

    // Unset all other default addresses
    await prisma.userAddresses.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this address as default
    const address = await prisma.userAddresses.update({
      where: { id },
      data: { isDefault: true },
    });

    response.status(200).json({
      success: true,
      message: 'Default address set successfully!',
      address,
    });
  } catch (error) {
    return next(error);
  }
};

//Change user password
export const changeUserPassword = async (request: any, response: Response, next: NextFunction) => {
  try {
    const userId = request.user.id;
    const { currentPassword, newPassword } = request.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return next(new ValidationError('Current password and new password are required!'));
    }

    // Get user with current password
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new AuthError('User not found!'));
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password ?? '');
    if (!isCurrentPasswordValid) {
      return next(new AuthError('Current password is incorrect!'));
    }

    // Check if new password is different from current
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password ?? '');
    if (isNewPasswordSame) {
      return next(new ValidationError('New password must be different from current password!'));
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return next(new ValidationError('New password must be at least 6 characters long!'));
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    response.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Get shop information
export const getShopInfo = async (request: any, response: Response, next: NextFunction) => {
  try {
    const sellerId = request.seller.id;

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
      include: {
        avatar: true,
        productAnalytics: true,
      },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found!'));
    }

    response.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

//Get shop information by id for public access
export const getShopInfoById = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { shopId } = request.params;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required!'));
    }

    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      include: {
        avatar: true,
        productAnalytics: true,
        products: {
          where: {
            isDeleted: false,
            status: 'ACTIVE',
          },
          include: {
            images: true,
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        sellers: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
            phone_number: true,
          },
        },
      },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found!'));
    }

    const totalProducts = shop.products?.length || 0;
    const totalReviews = shop.reviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? shop.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
        : shop.ratings || 0;

    return response.status(200).json({
      success: true,
      shop: {
        ...shop,
        totalProducts,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//Update shop information
export const updateShopInfo = async (request: any, response: Response, next: NextFunction) => {
  try {
    const sellerId = request.seller.id;
    const { name, bio, address, opening_hours, website, category, social_links } = request.body;

    // Validate required fields
    if (!name || !bio || !address || !opening_hours || !category) {
      return next(new ValidationError('Missing required fields!'));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found!'));
    }

    const updateData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
    };

    if (website && website.trim()) {
      updateData.website = website;
    }

    if (social_links && Array.isArray(social_links)) {
      updateData.social_links = social_links;
    }

    const updatedShop = await prisma.shops.update({
      where: { sellerId },
      data: updateData,
      include: {
        avatar: true,
        productAnalytics: true,
      },
    });

    response.status(200).json({
      success: true,
      message: 'Shop information updated successfully!',
      shop: updatedShop,
    });
  } catch (error) {
    return next(error);
  }
};

//Update shop cover banner
export const updateShopCoverBanner = async (request: any, response: Response, next: NextFunction) => {
  try {
    const sellerId = request.seller.id;
    const { coverBanner } = request.body;

    if (!coverBanner || typeof coverBanner !== 'string') {
      return next(new ValidationError('Cover banner file is required!'));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found!'));
    }

    const uploadResponse = await imageKit.upload({
      file: coverBanner,
      fileName: `shop-cover-${sellerId}-${Date.now()}.jpg`,
      folder: '/shops/cover-banners',
    });

    const updatedShop = await prisma.shops.update({
      where: { sellerId },
      data: { coverBanner: uploadResponse.url },
      include: {
        avatar: true,
        productAnalytics: true,
      },
    });

    response.status(200).json({
      success: true,
      message: 'Cover banner updated successfully!',
      shop: updatedShop,
    });
  } catch (error) {
    return next(error);
  }
};

//Create stripe connect account link
export const createStripeConnectLink = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { sellerId } = request.body;
    if (!sellerId) return next(new ValidationError('Seller ID is required.'));

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) return next(new ValidationError('Seller account not found.'));

    // Check if seller already has a Stripe account
    if (seller.stripeId) {
      // Check if the existing account is in the wrong region
      try {
        const existingAccount = await stripe.accounts.retrieve(seller.stripeId);
        if (existingAccount.country !== seller.country) {
          // Delete the old account and create a new one
          await stripe.accounts.del(seller.stripeId);
          await prisma.sellers.update({
            where: { id: sellerId },
            data: { stripeId: null },
          });
        }
      } catch (error) {
        // If account retrieval fails, assume it's invalid and create a new one
        await prisma.sellers.update({
          where: { id: sellerId },
          data: { stripeId: null },
        });
      }
    }

    // Create new Stripe account with seller's actual country
    const account = await stripe.accounts.create({
      type: 'express',
      email: seller.email,
      country: seller.country, // Use seller's actual country instead of hardcoded 'AU'
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://nextcart-seller.vercel.app/seller/success`,
      return_url: `https://nextcart-seller.vercel.app/seller/success`,
      type: 'account_onboarding',
    });

    response.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.log('Errors', error);
    return next(error);
  }
};
