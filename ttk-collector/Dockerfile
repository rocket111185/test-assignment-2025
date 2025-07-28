FROM node:lts-alpine
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY schema.prisma .
RUN npm run prisma:generate

COPY . .
CMD ["npm", "start"]
