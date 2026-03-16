# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory,
COPY package*.json ./
COPY prisma ./prisma/

# Install the application dependencies
RUN npm ci

# Generate prisma types
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE ${APP_PORT}

# Command to run the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
