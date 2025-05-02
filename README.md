# Secure Blog Platform

A secure, minimalist blog website with encrypted data storage, user authentication, and admin posting capabilities.

## Features

- User authentication with secure password hashing and salting
- Encrypted data storage for user information, blog posts, and contact forms
- Admin panel for managing blog posts
- Responsive design with clean, minimal aesthetics
- Support for both PostgreSQL and MongoDB databases

## Security Features

1. **Encrypted User Information**: All user data is encrypted in storage
2. **Password Hashing and Salting**: Using scrypt with salt for secure password storage
3. **Separate Credential Check Function**: For secure authentication
4. **Key Management Module**: Secure key generation and rotation
5. **Encrypted Posts**: All post content is encrypted/decrypted when saving/retrieving
6. **Comprehensive Encryption**: All sensitive data in the database is encrypted
7. **Integrity Check with MAC**: Data integrity verification

## Database Options

The application supports two database systems:

### PostgreSQL (Default)

The application uses PostgreSQL with Drizzle ORM by default.

- Start the server: `npm run dev`
- Seed the database: `npm run db:seed`

### MongoDB

The application also supports MongoDB with Mongoose.

- Start the MongoDB server: `./run-mongodb-server.sh`
- Seed the MongoDB database: `./run-mongodb-seed.sh`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# PostgreSQL (Default)
DATABASE_URL=postgres://user:password@localhost:5432/secure_blog

# MongoDB
MONGODB_URI=mongodb://localhost:27017/secure_blog

# Session secret
SESSION_SECRET=your-secret-key
```

## Project Structure

- `/client`: React frontend with TypeScript
  - `/src/components`: UI components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions
  - `/src/pages`: Page components
- `/server`: Express backend
  - `index.ts`: Main entry point for PostgreSQL
  - `mongodb-index.ts`: Main entry point for MongoDB
  - `routes.ts`: API routes for PostgreSQL
  - `mongodb-routes.ts`: API routes for MongoDB
  - `auth.ts`: Authentication logic for PostgreSQL
  - `mongodb-auth.ts`: Authentication logic for MongoDB
  - `encryption.ts`: Data encryption/decryption utilities
  - `key-management.ts`: Encryption key management
- `/db`: Database configuration
  - `index.ts`: PostgreSQL/Drizzle configuration
  - `mongodb.ts`: MongoDB/Mongoose configuration
  - `seed.ts`: PostgreSQL database seeding
  - `mongodb-seed.ts`: MongoDB database seeding
- `/shared`: Shared code between frontend and backend
  - `schema.ts`: PostgreSQL database schema
  - `mongodb-schema.ts`: MongoDB database schema