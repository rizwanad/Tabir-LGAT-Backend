FROM node:23-alpine3.20

# Install PM2 globally
RUN npm install pm2 -g

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000