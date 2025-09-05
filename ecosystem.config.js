module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: 'dist/apps/auth-service/main.js',
      env: { PORT: 6001 },
    },
    {
      name: 'product-service',
      script: 'dist/apps/product-service/main.js',
      env: { PORT: 6002 },
    },
    {
      name: 'order-service',
      script: 'dist/apps/order-service/main.js',
      env: { PORT: 6004 },
    },
    {
      name: 'chat-service',
      script: 'dist/apps/chat-service/main.js',
      env: { PORT: 6005 },
    },
    {
      name: 'api-gateway',
      script: 'dist/apps/api-gateway/main.js',
      env: { PORT: 8080 },
    },
  ],
};
