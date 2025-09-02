FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy workspace dependencies
COPY packages/ ./packages/

# Copy the specific app
COPY apps/product-service/ ./apps/product-service/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build product-service

# Expose port
EXPOSE 6002

# Start the application
CMD ["npx", "nx", "serve", "product-service", "--configuration=production"]
