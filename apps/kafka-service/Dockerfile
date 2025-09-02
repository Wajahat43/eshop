FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy workspace dependencies
COPY packages/ ./packages/

# Copy the specific app
COPY apps/kafka-service/ ./apps/kafka-service/

# Install dependencies
RUN npm ci --only=production

# Build the application
RUN npx nx build kafka-service

# Start the application
CMD ["npx", "nx", "serve", "kafka-service", "--configuration=production"]
