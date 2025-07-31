FROM node:lts-alpine
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY schema.prisma .
RUN npm run prisma:generate

COPY . .

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
