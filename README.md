# Notification Service

A TypeScript-based notification service that handles various types of notifications with secure authentication.

## Project Structure

```
notification-service/
├── src/
│   ├── config/         # Configuration files and environment variables
│   ├── controllers/    # Route handlers and business logic
│   ├── middleware/     # Custom middleware including authentication
│   ├── services/       # Core business logic and external service integrations
│   ├── types/         # TypeScript type definitions and interfaces
│   ├── scripts/       # Utility scripts and database migrations
│   ├── config.ts      # Main configuration file
│   └── index.ts       # Application entry point
```

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Environment Variables**: dotenv

## Authentication Flow

The service implements JWT-based authentication with the following flow:

1. **User Authentication**:
   - Users provide credentials (username/password)
   - Service validates credentials
   - On successful validation, JWT token is generated and returned

2. **Token Verification**:
   - Each protected route is guarded by authentication middleware
   - Middleware validates JWT token from Authorization header
   - Invalid/expired tokens result in 401 Unauthorized response

3. **Protected Routes**:
   - All notification endpoints require valid authentication
   - Tokens include user role and permissions
   - Role-based access control for different notification operations

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Notifications
- `POST /notifications` - Create new notification
- `GET /notifications` - List notifications
- `GET /notifications/:id` - Get specific notification
- `PUT /notifications/:id` - Update notification
- `DELETE /notifications/:id` - Delete notification

## Environment Variables

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/notification-service.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the service:
```bash
npm run dev    # Development
npm run build  # Build for production
npm start      # Production
```

## Security Features

- JWT-based authentication
- Rate limiting
- Request validation
- CORS protection
- Helmet security headers
- Input sanitization

## Error Handling

The service implements a centralized error handling mechanism with:
- Custom error classes
- Standardized error responses
- Detailed error logging
- Request validation errors
- Authentication/Authorization errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.