# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source files
COPY . .

# Set dynamic configuration parameters at build time
ARG VITE_API_BASE_URL=/api
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK

# Compile Vite production build bundle
RUN npm run build

# Stage 2: Serve stage with secure and optimized Nginx server
FROM nginx:1.25-alpine

# Copy optimized nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx root directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
