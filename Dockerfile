# Dockerfile for SiYuan Plugin Translation and Build
FROM node:20-alpine

# Install git (needed for some npm packages)
RUN apk add --no-cache git

# Set working directory
WORKDIR /workspace

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Default command - open a shell for interactive work
CMD ["/bin/sh"]
