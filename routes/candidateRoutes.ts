// Purpose: Defines routes for managing candidates.
// This file sets up the API endpoints for creating, retrieving, updating, and deleting candidates,
// and maps them to the corresponding controller functions.
import express, { Request, Response } from 'express';
import { getById, create, update, remove } from '../controllers/candidateController.js';
import pool from '../config/database.js';

const router = express.Router();

// Get all candidates with vote counts
router.get('/', async (req: Request, res: Response) => {
    try {
        const [candidates] = await pool.query(`
      SELECT 
        c.cid               AS candidateid,
        c.name              AS name,
        c.gender            AS gender,
        p.name              AS partyname,
        c.symbol_url        AS symbol,
        c.electionid        AS electionid,
        e.type              AS electiontype,
        e.date              AS electiondate,
        e.location_region   AS locationregion,
        COUNT(v.voteid)     AS votecount
      FROM candidates c
      LEFT JOIN elections e ON c.electionid = e.electionid
      LEFT JOIN votes v ON c.cid = v.candidateid
      LEFT JOIN parties p ON c.partyid = p.partyid
      GROUP BY c.cid
      ORDER BY e.date DESC, c.name
    `);

        res.json(candidates);
    } catch (error: any) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Error fetching candidates', error: error.message });
    }
});

router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router; 