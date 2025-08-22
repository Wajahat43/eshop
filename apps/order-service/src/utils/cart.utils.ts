// Helper function to normalize cart (sort and remove duplicates)
export const normalizeCart = (cart: any[]) => {
  // Sort by product ID and remove duplicates
  const uniqueItems = new Map();

  cart.forEach((item) => {
    const key = `${item.productId}_${item.variantId || 'default'}`;
    if (uniqueItems.has(key)) {
      // If duplicate found, sum the quantities
      uniqueItems.get(key).quantity += item.quantity;
    } else {
      uniqueItems.set(key, { ...item });
    }
  });

  // Convert back to array and sort by product ID
  // The JSON.stringify in generateCartHash will handle the normalization
  return Array.from(uniqueItems.values()).sort((a, b) => a.productId.localeCompare(b.productId));
};

import crypto from 'crypto';

// Helper function to generate cart hash
export const generateCartHash = (cart: any[]) => {
  const cartString = JSON.stringify(cart);
  // Use crypto.createHash for a more robust and secure hash
  return crypto.createHash('sha256').update(cartString).digest('hex');
};

// Helper function to generate unique session ID using crypto
export const generateSessionId = () => {
  // Generate a random 16-byte buffer and convert to hex
  const randomBytes = crypto.randomBytes(16);
  const timestamp = Date.now();
  return `session_${timestamp}_${randomBytes.toString('hex')}`;
};
