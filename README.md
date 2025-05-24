<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A modern Events venue management system built with <a href="http://nodejs.org" target="_blank">NestJS</a> and <a href="https://www.prisma.io/" target="_blank">Prisma</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

"The Knot Events" is a comprehensive wedding venue management platform built with NestJS and Prisma. This application helps venue owners and event planners manage bookings, client information, venue details, and event schedules.

## Features

- User authentication and role-based access control
- Venue management and booking system
- Event scheduling and calendar integration
- Client relationship management
- Invoicing and payment tracking
- Customizable event templates

## Technology Stack

- **Backend**: NestJS (TypeScript-based Node.js framework)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Deployment**: Docker & Render

## Project Setup

```bash
# Install dependencies
$ npm install

# Generate Prisma client
$ npm run generate

# Set up the database
$ npm run migrate

# Seed the database with initial data
$ npm run seed
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Production Database
DATABASE_URL="postgresql://${PROD_DATABASE_USERNAME}:${PROD_DATABASE_PASSWORD}@${PROD_DATABASE_HOST}:${PROD_DATABASE_PORT}/${PROD_DATABASE_NAME}?sslmode=require"

# Production Database connection details
PROD_DATABASE_HOST=your_production_host
PROD_DATABASE_PORT=your_production_port
PROD_DATABASE_USERNAME=your_production_username
PROD_DATABASE_PASSWORD=your_production_password
PROD_DATABASE_NAME=your_production_dbname

# Local Database connection details
LOCAL_DATABASE_HOST=localhost
LOCAL_DATABASE_PORT=5432
LOCAL_DATABASE_USERNAME=postgres
LOCAL_DATABASE_PASSWORD=postgres
LOCAL_DATABASE_NAME=knotesevents

# JWT settings
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRATION=1d

# Cloudinary
CLOUDINARY_CLOUD_NAME="xyz"
CLOUDINARY_API_KEY="xyz"
CLOUDINARY_API_SECRET="xy-FoqzdwcbRSo"
```

## Database Management

```bash
# Generate Prisma client
$ npm run generate

# Create and apply migrations
$ pnpm run migrate -- --name name_of_your_migration

# Apply migrations in production
$ npm run migrate:deploy

# Push schema changes without migrations
$ npm run db:push

# Reset database (drop all tables and reapply migrations)
$ npm run reset

# Open Prisma Studio (database GUI)
$ npm run studio
```

## Running the Application

```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your application to production:

```bash
# Build the application
$ npm run build

# Apply migrations in production
$ npm run migrate:deploy
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For support, please open an issue in the repository or contact the development team.

## License

This project is [MIT licensed](LICENSE).
