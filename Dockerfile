# Stage 1: Build the Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set env var for production build
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Setup the Backend & Serve
FROM node:18-alpine
WORKDIR /app/backend

# Copy backend dependencies first for caching
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets from Stage 1 to a 'dist' folder at the root level relative to backend
# Our server.js expects '../dist', so if we are in /app/backend, we need /app/dist
WORKDIR /app
COPY --from=frontend-build /app/dist ./dist

# Switch back to backend to run
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 5001

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Start the server
CMD ["node", "server.js"]
