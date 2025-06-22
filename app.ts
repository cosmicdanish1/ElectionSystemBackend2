// Purpose: Main application entry point. This file initializes the Express server,
// configures middleware (CORS, sessions, JSON parsing), sets up API routes,
// and starts the server.
import dotenv from 'dotenv'; // This must be the very first line for dotenv
dotenv.config(); // Load environment variables first

import express, { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import db from './config/database.js'; // Make sure to import the database pool
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import voterRoutes from './routes/voterRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import electionRoutes from './routes/electionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import userRoutes from './routes/userRoutes.js';
import voterRegistrationRoutes from './routes/voterRegistrationRoutes.js';

const app: Express = express();
const PORT: string | number = process.env.PORT || 3000;

console.log('--- Debugging express-session import ---');
console.log('Type of session:', typeof session);
console.log('session object:', session);
console.log('session.Store exists:', !!session.Store);
console.log('Type of session.Store:', typeof session.Store);
console.log('--- End Debugging ---');

// Initialize MySQLStore by passing the express-session object to the factory
const MySQLStore = MySQLStoreFactory(session as any);

// CORS configuration - Fixed for proper cookie handling
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Session store configuration
// NOTE: sessionStore must be a singleton (do not re-create per request)
const sessionStore = new MySQLStore({
  expiration: 3600000, // 1 hour in milliseconds
  endConnectionOnClose: true
}, db); // Pass the raw pool object directly (since database.js exports it as default)

// Add error logging for session store
sessionStore.on('error', function(error: any) {
  console.error('Session store error:', error);
});

// Session middleware - Best practice for local development
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // Use a strong secret from .env
  store: sessionStore,
  resave: false, // Only save session if modified
  saveUninitialized: false, // Only save if something is set
  name: 'connect.sid', // Explicitly set cookie name
  cookie: {
    secure: false, // Always false for local development (HTTP)
    httpOnly: true,
    sameSite: 'lax', // 'lax' is safest for local development
    maxAge: 3600000, // 1 hour in milliseconds
    path: '/' // Ensure cookie is sent for all paths
    // For production: set secure: true and sameSite: 'none' if using HTTPS
  }
}));

// Add session debugging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 === SESSION DEBUG ===');
  console.log('🔍 Session ID:', req.sessionID);
  console.log('🔍 Session object:', req.session);
  // @ts-ignore
  console.log('🔍 Session user:', req.session?.user);
  console.log('🔍 Session keys:', Object.keys(req.session || {}));
  console.log('🔍 === END SESSION DEBUG ===');
  next();
});

// Load Swagger doc once
const swaggerDocument = YAML.load('./docs/swagger.yaml');

// Middleware
app.use(express.json());
app.use(cookieParser());

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/test', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/voter-registration', voterRegistrationRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.send('Election Management API is running');
});

// Error handling middleware (with 4 params)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Session secret: ${process.env.SESSION_SECRET ? 'Set' : 'Using default'}`);
});

export default app; 