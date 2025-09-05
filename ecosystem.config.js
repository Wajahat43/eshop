module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: 'apps/auth-service/dist/main.js',
      env: { PORT: 6001 },
    },
    {
      name: 'product-service',
      script: 'apps/product-service/dist/main.js',
      env: { PORT: 6002 },
    },
    {
      name: 'order-service',
      script: 'apps/order-service/dist/main.js',
      env: { PORT: 6004 },
    },
    {
      name: 'chat-service',
      script: 'apps/chat-service/dist/main.js',
      env: { PORT: 6005 },
    },
    {
      name: 'api-gateway',
      script: 'apps/api-gateway/dist/main.js',
      env: { PORT: 8080 },
    },
  ],
};
