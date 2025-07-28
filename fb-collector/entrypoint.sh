#!/bin/sh

npm run prisma:migrate:dev -- --name facebook-init --create-only
npm run prisma:migrate:deploy

# Start the application
npm start
