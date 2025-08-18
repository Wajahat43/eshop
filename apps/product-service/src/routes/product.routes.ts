import express, { Router } from 'express';
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getAllEvents,
  getCategories,
  getDiscountCodes,
  getShopProducts,
  getProductDetails,
  getFilteredProducts,
  getFilteredEvents,
  getFilteredShops,
  searchProducts,
  getTopShops,
  restoreProduct,
  uploadProductImage,
} from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router: Router = express.Router();

router.get('/get-categories', getCategories);
router.post('/create-discount-code', isAuthenticated, createDiscountCodes);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);
router.post('/create-product', isAuthenticated, createProduct);
router.get('/get-shop-products', isAuthenticated, getShopProducts);
router.delete('/delete-product/:id', isAuthenticated, deleteProduct);
router.put('/restore-product/:id', isAuthenticated, restoreProduct);

router.get('/get-all-products', getAllProducts);
router.get('/get-all-events', getAllEvents);
router.get('/get-filtered-products', getFilteredProducts);
router.get('/get-filtered-events', getFilteredEvents);
router.get('/get-filtered-shops', getFilteredShops);
router.get('/search-products', searchProducts);
router.get('/top-shops', getTopShops);
router.get('/get-product/:slug', getProductDetails);

export default router;
