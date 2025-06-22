// Purpose: Defines routes for managing elections.
// This file sets up the API endpoints for CRUD operations on elections,
// as well as routes for checking vote status and submitting votes.
import express, { Request, Response } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/electionController.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Get all elections with candidates and voting status
router.get('/', async (req: Request, res: Response) => {
    try {
        const [elections] = await pool.query(`
      SELECT 
        e.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'candidateid', c.cid,
            'name', c.name,
            'partyname', p.name,
            'symbol', c.symbol_url
          )
        ) as candidates
      FROM elections e
      LEFT JOIN candidates c ON e.electionid = c.electionid
      LEFT JOIN parties p ON c.partyid = p.partyid
      WHERE e.status IN ('Ongoing', 'Upcoming')
      GROUP BY e.electionid
      ORDER BY e.date DESC
    `);

        // Process the candidates string into an array of objects
        const processedElections = (elections as any[]).map(election => ({
            ...election,
            candidates: election.candidates ?
                election.candidates.split('},{').map((c: string, i: number, arr: string[]) => {
                    if (arr.length > 1) {
                        if (i === 0) c = c + '}';
                        else if (i === arr.length - 1) c = '{' + c;
                        else c = '{' + c + '}';
                    }
                    return JSON.parse(c)
                }) :
                []
        }));

        res.json(processedElections);
    } catch (error: any) {
        console.error('Error fetching elections:', error);
        res.status(500).json({ message: 'Error fetching elections', error: error.message });
    }
});

// Check if user has voted in an election
router.get('/:electionId/vote-status/:userId', async (req: Request, res: Response) => {
    try {
        const { electionId, userId } = req.params;
        const [votes] = await pool.query(`
      SELECT COUNT(*) as hasVoted
      FROM votes v
      WHERE v.electionid = ? AND v.voterid = ?
    `, [electionId, userId]);

        res.json({ hasVoted: (votes as any)[0].hasVoted > 0 });
    } catch (error: any) {
        console.error('Error checking vote status:', error);
        res.status(500).json({ message: 'Error checking vote status', error: error.message });
    }
});

// Submit a vote
router.post('/:electionId/vote', async (req: Request, res: Response) => {
    const { electionId } = req.params;
    const { candidateId, voterId } = req.body;

    try {
        // Check if user has already voted in this election
        const [existingVotes] = await pool.query(`
      SELECT COUNT(*) as hasVoted
      FROM votes v
      WHERE v.electionid = ? AND v.voterid = ?
    `, [electionId, voterId]);

        if ((existingVotes as any)[0].hasVoted > 0) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // Record the vote
        await pool.query(`
      INSERT INTO votes (voterid, candidateid, electionid)
      VALUES (?, ?, ?)
    `, [voterId, candidateId, electionId]);

        res.json({ message: 'Vote recorded successfully' });
    } catch (error: any) {
        console.error('Error recording vote:', error);
        res.status(500).json({ message: 'Error recording vote', error: error.message });
    }
});

export default router; 