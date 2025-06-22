// Purpose: Defines the route for voter registration.
// This file sets up the API endpoint for registering a user as a voter.
import express from 'express';
import { registerVoter } from '../controllers/voterRegistrationController.js';

const router = express.Router();

router.post('/', registerVoter);

export default router; 