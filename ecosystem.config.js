module.exports = {
  apps: [
    { name: 'auth-service', script: 'apps/auth-service/dist/main.js' },
    { name: 'product-service', script: 'apps/product-service/dist/main.js' },
    { name: 'order-service', script: 'apps/order-service/dist/main.js' },
    { name: 'chat-service', script: 'apps/chat-service/dist/main.js' },
    { name: 'api-gateway', script: 'apps/api-gateway/dist/main.js' },
  ],
};
