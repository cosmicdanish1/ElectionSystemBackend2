// Purpose: Controller for Voter Registration.
// This file handles the logic for registering a user as a voter,
// including validation and insertion into the database.
import { Request, Response } from 'express';
import db from '../config/database.js';

export const registerVoter = async (req: Request, res: Response) => {
    try {
        console.log('🔔 registerVoter route hit');
        console.log('Received body:', req.body);
        const { userid, aadharid, address, nationality, voter_card_id, state } = req.body;

        // Validate required fields
        if (!userid || !aadharid || !address || !nationality || !voter_card_id || !state) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (nationality.toLowerCase() !== 'indian') {
            console.log('❌ Nationality not Indian');
            return res.status(400).json({ error: 'Only Indian nationals can register.' });
        }

        // Insert into voters
        await db.query(
            `INSERT INTO voters (userid, aadharid, address, state, nationality, voter_card_id, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [userid, aadharid, address, state, nationality, voter_card_id]
        );
        console.log('✅ Registration inserted successfully');
        res.status(201).json({ message: 'Registration successful!' });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('❌ Duplicate entry error');
            return res.status(400).json({ error: 'Aadhar or Voter Card ID already registered.' });
        }
        console.error('🔥 registerVoter error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
}; 