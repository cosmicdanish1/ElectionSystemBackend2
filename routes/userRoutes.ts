// Purpose: Defines routes for managing users.
// This file sets up the API endpoints for creating, retrieving, updating, and deleting users,
// as well as fetching the current user's profile.
import express from 'express';
import { getAll, getById, create, update, remove, getCurrentUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/profile', getCurrentUserProfile);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router; 