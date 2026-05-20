FROM node:20-alpine

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install only production dependencies for smaller image footprints
RUN npm ci --only=production

# Copy backend source files
COPY . .

# Expose backend PORT
EXPOSE 3060

# Boot command
CMD ["node", "index.js"]
