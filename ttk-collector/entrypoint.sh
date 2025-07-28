#!/bin/sh

npm run prisma:migrate:dev -- --name init --create-only
npm run prisma:migrate:deploy

# Start the application
npm start
