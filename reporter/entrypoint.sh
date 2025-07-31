#!/bin/sh

# Run Prisma migrations
npm run prisma:migrate:dev -- --name initialization --create-only
npm run prisma:migrate:deploy

# Use this line with caution! Useful for development environment, where
# data retention is not important, but extremely dangerous for prod
# npm run prisma:force-push

# Start the application
npm start
