FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy workspace dependencies
COPY packages/ ./packages/

# Copy the specific app
COPY apps/chat-service/ ./apps/chat-service/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build chat-service

# Expose port
EXPOSE 6005

# Start the application
CMD ["npx", "nx", "serve", "chat-service", "--configuration=production"]
