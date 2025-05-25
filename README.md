<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A modern job recruitment platform built with <a href="http://nodejs.org" target="_blank">NestJS</a> and <a href="https://www.prisma.io/" target="_blank">Prisma</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

JobConnect is a comprehensive job recruitment platform connecting workers (teachers, cleaners, housemaids, security personnel, cooks) with recruiters (individuals, groups, or companies). The platform facilitates job postings, applications, and work assignments management.

## Features

- **User Management**: Three distinct roles (Admin, Recruiter, Worker)
- **Recruiter Profiles**: Support for individual, group, and company recruiters
- **Worker Profiles**: Skills, experience, availability tracking
- **Job Listings**: Categorized job postings with flexible salary options
- **Application System**: Workers can apply to jobs with status tracking
- **Work Assignments**: Schedule and manage active work assignments
- **Authentication**: Secure JWT-based authentication

## Technology Stack

- **Backend**: NestJS (TypeScript-based Node.js framework)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

## Data Models

The system implements the following core models:

- **User**: Base user with authentication (Admin, Recruiter, Worker roles)
- **Recruiter**: Extended profile for recruiters (individuals, groups, companies)
- **Worker**: Extended profile for workers with skills and availability
- **JobCategory**: Categories like Teacher, Cleaner, Housemaid, etc.
- **Job**: Job postings with salary and requirements
- **Application**: Worker applications to jobs
- **WorkAssignment**: Active work assignments with scheduling

## Project Setup


# Install dependencies
$ npm install

# Generate Prisma client
$ npm run generate

# Set up the database
$ npm run migrate

# Seed the database with initial data
$ npm run seed
Environment Configuration
Create a .env file in the root directory with the following variables:

# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Local Development (default values)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobconnect

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRATION=1d

# Optional File Upload Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Database Management
bash
# Generate Prisma client
$ npm run generate

# Create and apply migrations
$ npm run migrate -- --name name_of_your_migration

# Apply pending migrations
$ npm run migrate:deploy

# Reset database (development only)
$ npm run reset

# Open Prisma Studio (GUI for database)
$ npm run studio
Running the Application
bash
# Development mode
$ npm run start:dev

# Production build
$ npm run build
$ npm run start:prod
Testing
bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
API Documentation
Once the application is running, access the Swagger UI at:

http://localhost:3000/api
Deployment
For production deployment:

Set up your production database and update .env

Build the application:

bash
npm run build
Apply migrations:

bash
npm run migrate:deploy
Start the production server:

bash
npm run start:prod
License
This project is MIT licensed.
