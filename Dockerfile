FROM node:18-alpine

WORKDIR /app

# Add Python and build tools for node-gyp
RUN apk add --no-cache python3 make g++ gcc

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy project files
COPY . .

# Build client
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]