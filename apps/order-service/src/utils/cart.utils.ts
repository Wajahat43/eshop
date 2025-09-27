// Helper function to normalize cart (sort and remove duplicates)
export const normalizeCart = (cart: any[]) => {
  // Sort by product ID and remove duplicates
  const uniqueItems = new Map();

  cart.forEach((item) => {
    if (!item || !item.id) {
      return;
    }

    const key = `${item.id}_${item.variantId || 'default'}`;
    if (uniqueItems.has(key)) {
      const existing = uniqueItems.get(key);
      existing.quantity += item.quantity;
      existing.sale_price = item.sale_price;
      existing.shopId = item.shopId;
      existing.selectedOptions = item.selectedOptions;
    } else {
      uniqueItems.set(key, { ...item });
    }
  });

  // Convert back to array and sort by product ID
  // The JSON.stringify in generateCartHash will handle the normalization
  return Array.from(uniqueItems.values()).sort((a, b) => a.id.localeCompare(b.id));
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
