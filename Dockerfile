# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate prisma types
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE ${APP_PORT}

# Command to run the application
CMD ["node", "dist/main"]