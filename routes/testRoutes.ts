// Purpose: Defines test routes for health checks.
// This file provides simple endpoints to verify that the backend server is running and accessible.
import express, { Request, Response } from 'express';

const router = express.Router();

// Test endpoint
router.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'success',
        message: 'Backend is running and connected',
        timestamp: new Date().toISOString()
    });
});

// Test connection endpoint
router.get('/connection', (req: Request, res: Response) => {
    res.json({
        status: 'success',
        message: 'Backend is connected and running',
        timestamp: new Date().toISOString()
    });
});

export default router; 