# Election Management System

A Node.js/TypeScript application for managing elections, candidates, and votes.

## Features

- User authentication and authorization (admin, committee, voter roles)
- Election management (create, read, update, delete)
- Candidate management
- Voting system
- Profile management
- Voting history
- API documentation with Swagger
- Input validation
- Error logging
- Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd election-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=election_system

# JWT Configuration
JWT_SECRET=your_secret_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

4. Create the database:
```bash
mysql -u root -p
CREATE DATABASE election_system;
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

Once the server is running, visit:
```
http://localhost:3000/api-docs
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── tests/          # Test files
├── utils/          # Utility functions
└── app.ts          # Express app setup
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 