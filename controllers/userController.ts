// Purpose: Controller for User operations.
// This file contains functions that handle the business logic for user-related API requests.
// It interacts with the user and voter models to perform CRUD operations and retrieve user profiles.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllUsers, getById as getUserById, create as createUser, update as updateUser, remove as removeUser } from '../models/userModel.js';
import { getByUserId as getVoterByUserId } from '../models/voterModel.js';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
    userid: number;
    name: string;
    email: string;
    role: string;
    gender: string;
    date_of_birth: string;
    created_at: string;
    profile_photo_url: string;
}

interface Voter extends RowDataPacket {
    vid: number;
    userid: number;
    aadharid: string;
    address: string;
    nationality: string;
    voter_card_id: string;
    is_verified: boolean;
    registered_at: string;
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getAllUsers();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getUserById(Number(req.params.id));
        if ((rows as any).length === 0) return res.status(404).json({ message: 'User not found' });
        res.json((rows as any)[0]);
    } catch (err) {
        next(err);
    }
};

export const getCurrentUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('🔍 === getCurrentUserProfile START ===');
        console.log('🔍 Request headers:', req.headers);
        console.log('🔍 Request cookies:', req.cookies);
        console.log('🔍 Session object:', req.session);
        console.log('🔍 Session ID:', req.sessionID);
        // @ts-ignore
        console.log('🔍 Session user:', req.session.user);
        // @ts-ignore
        console.log('🔍 Session user type:', typeof req.session.user);

        // Check if user is authenticated via session
        // @ts-ignore
        if (!req.session.user) {
            console.log('❌ No session user found - returning 401');
            console.log('🔍 Session keys:', Object.keys(req.session));
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // @ts-ignore
        const userId = req.session.user.UserId || req.session.user.userid || req.session.user.id;
        console.log('🔍 Extracted userId:', userId);
        // @ts-ignore
        console.log('🔍 Session user properties:', Object.keys(req.session.user));
        // @ts-ignore
        console.log('🔍 Full session user object:', JSON.stringify(req.session.user, null, 2));

        if (!userId) {
            console.log('❌ No userId found in session - returning 401');
            return res.status(401).json({ error: 'Invalid session - no user ID' });
        }

        console.log('🔍 Querying user from database with ID:', userId);
        // Get user information
        const [userRows] = await getUserById(userId);
        console.log('🔍 User rows from DB:', (userRows as any).length);
        console.log('🔍 User data from DB:', JSON.stringify(userRows, null, 2));

        if ((userRows as any).length === 0) {
            console.log('❌ User not found in database - returning 404');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('🔍 Querying voter from database with UserId:', userId);
        // Get voter information
        const [voterRows] = await getVoterByUserId(userId);
        console.log('🔍 Voter rows from DB:', (voterRows as any).length);
        console.log('🔍 Voter data from DB:', JSON.stringify(voterRows, null, 2));

        const user = (userRows as User[])[0];
        const voter = (voterRows as Voter[])[0];

        // Combine user and voter information
        const userProfile = {
            // User information
            id: user.userid,
            name: user.name,
            email: user.email,
            role: user.role,
            gender: user.gender,
            date_of_birth: user.date_of_birth,
            created_at: user.created_at,
            profile_photo_url: user.profile_photo_url,

            // Voter information (if available)
            ...(voter && {
                aadharid: voter.aadharid,
                address: voter.address,
                nationality: voter.nationality,
                voter_card_id: voter.voter_card_id,
                is_verified: voter.is_verified,
                registered_at: voter.registered_at,
                vid: voter.vid,
            })
        };

        console.log('✅ Final user profile object:', JSON.stringify(userProfile, null, 2));
        console.log('🔍 === getCurrentUserProfile END ===');
        res.json(userProfile);
    } catch (err) {
        console.error('🔥 Error in getCurrentUserProfile:', err);
        console.error('🔥 Error stack:', (err as Error).stack);
        next(err);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [result] = await createUser(req.body);
        res.status(201).json({ id: (result as any).insertId, ...req.body });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateUser(Number(req.params.id), req.body);
        res.json({ message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeUser(Number(req.params.id));
        res.json({ message: 'User deleted' });
    } catch (err) {
        next(err);
    }
}; 