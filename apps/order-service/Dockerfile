FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy workspace dependencies
COPY packages/ ./packages/

# Copy the specific app
COPY apps/order-service/ ./apps/order-service/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build order-service

# Expose port
EXPOSE 6004

# Start the application
CMD ["npx", "nx", "serve", "order-service", "--configuration=production"]
