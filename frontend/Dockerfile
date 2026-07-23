FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Run in dev mode for testing hot-reloads locally
CMD ["npm", "run", "dev"]
