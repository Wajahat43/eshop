FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy workspace dependencies
COPY packages/ ./packages/

# Copy the specific app
COPY apps/api-gateway/ ./apps/api-gateway/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build api-gateway

# Expose port
EXPOSE 8080

# Start the application
CMD ["npx", "nx", "serve", "api-gateway", "--configuration=production"]
