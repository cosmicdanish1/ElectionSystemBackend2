// Purpose: Defines routes for managing votes.
// This file sets up the API endpoints for creating, retrieving, updating, and deleting votes.
import express from 'express';
import { getAll, getById, create, update, remove, getLeaderboard } from '../controllers/voteController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/leaderboard/:electionid', getLeaderboard);

export default router; 