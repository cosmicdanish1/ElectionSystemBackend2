// Purpose: Defines authentication-related routes for the application.
// This file includes endpoints for user registration, login, logout, and checking authentication status.
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

interface User extends RowDataPacket {
    userid: number;
    name: string;
    email: string;
    role: string;
    password?: string;
    gender: string;
    date_of_birth: string;
}

// Login route
router.post('/login', async (req: Request, res: Response) => {
    console.log('🔐 === LOGIN START ===');
    console.log('🔐 Login attempt:', { email: req.body.email, role: req.body.role });
    console.log('🔐 Request body:', req.body);
    console.log('🔐 Session before login:', req.session);
    console.log('🔐 Session ID before login:', req.sessionID);

    try {
        const { email, password, role } = req.body;

        // Query user from database
        console.log('🔐 Querying database for user:', { email, role });
        const [users] = await db.query<User[]>(
            'SELECT * FROM users WHERE email = ? AND role = ?',
            [email, role]
        );

        console.log('🔐 Database query result:', users.length, 'users found');
        if (users.length > 0) {
            console.log('🔐 User found:', { userid: users[0].userid, name: users[0].name, email: users[0].email, role: users[0].role });
        }

        if (users.length === 0) {
            console.log('❌ Login failed: User not found', { email, role });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        console.log('🔐 User fetched from DB in login route:', user);

        // Check password
        console.log('🔐 Checking password...');
        const validPassword = await bcrypt.compare(password, user.password!);
        console.log('🔐 Password valid:', validPassword);

        if (!validPassword) {
            console.log('❌ Login failed: Invalid password', { email });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session data with correct property names
        const sessionUser = {
            userid: user.userid,
            email: user.email,
            role: user.role,
            gender: user.gender,
            date_of_birth: user.date_of_birth
        };

        console.log('🔐 Setting session user object:', sessionUser);
        // @ts-ignore
        req.session.user = sessionUser;

        console.log('🔐 Session after setting user:', req.session);
        console.log('🔐 Session ID after setting user:', req.sessionID);
        // @ts-ignore
        console.log('🔐 Session user after setting:', req.session.user);

        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('🔥 Session save error:', err);
                return res.status(500).json({ error: 'Session save failed' });
            }

            console.log('✅ Session saved successfully');
            console.log('🔐 Final session state:', req.session);
            console.log('🔐 Final session ID:', req.sessionID);
            console.log('🔐 Response headers being set:', res.getHeaders());

            res.json({
                user: {
                    id: user.userid,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    gender: user.gender,
                    date_of_birth: user.date_of_birth
                }
            });
            console.log('🔐 === LOGIN END ===');
        });
    } catch (error) {
        console.error('🔥 Login error:', error);
        console.error('🔥 Login error stack:', (error as Error).stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register route
router.post('/register', async (req: Request, res: Response) => {
    console.log('📝 Registration attempt:', { email: req.body.email, name: req.body.name });
    try {
        const { name: rawName, email, password, role, gender, date_of_birth } = req.body;
        const name = rawName || ''; // Ensure name is always a string, even if empty or null

        // Check if user already exists
        const [existingUsers] = await db.query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            console.log('❌ Registration failed: User already exists', { email });
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        // Save user to database with new fields
        const insertQuery = 'INSERT INTO users (name, email, password, role, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)';
        const queryParams = [name, email, hashedPassword, role, gender, date_of_birth];
        console.log('Executing insert query:', insertQuery, queryParams);

        const [result] = await db.query<any>(
            insertQuery,
            queryParams
        );

        console.log('Insert result:', result);

        const newUser = {
            id: result.insertId,
            name,
            email,
            role,
            gender,
            date_of_birth
        };

        // Set session data with correct property names
        // @ts-ignore
        req.session.user = {
            userid: newUser.id,
            email: newUser.email,
            role: newUser.role
        };

        console.log('✅ Registration successful - Session set:', req.session.user);
        res.status(201).json({
            user: newUser
        });
    } catch (error: any) {
        console.error('🔥 Registration error details (FULL STACK TRACE):', error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
    }
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
    console.log('🚪 Logout attempt - Current session:', req.session);
    req.session.destroy((err) => {
        if (err) {
            console.error('🔥 Logout error:', err);
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        console.log('✅ Logout successful');
        res.json({ message: 'Logged out successfully' });
    });
});

// Check if user is authenticated (session-based)
router.get('/me', (req: Request, res: Response) => {
    console.log('🔍 === /api/auth/me START ===');
    console.log('🔍 Session:', req.session);
    console.log('🔍 Session ID:', req.sessionID);
    // @ts-ignore
    console.log('🔍 User in session:', req.session.user);

    // @ts-ignore
    if (req.session && req.session.user) {
        console.log('✅ User authenticated via session');
        res.json({
            // @ts-ignore
            user: req.session.user,
            authenticated: true
        });
    } else {
        console.log('❌ No user in session');
        res.status(401).json({
            error: 'Not authenticated',
            authenticated: false
        });
    }
    console.log('🔍 === /api/auth/me END ===');
});

export default router; 