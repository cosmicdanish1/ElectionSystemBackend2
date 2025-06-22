// Purpose: Defines routes for managing voter profiles.
// This file sets up the API endpoints for creating, retrieving, updating, and deleting voter-specific profiles.
import express from 'express';
import { getAll, getById, getVoterByUserId, create, update, remove } from '../controllers/voterController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.get('/by-user/:userid', getVoterByUserId);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router; 