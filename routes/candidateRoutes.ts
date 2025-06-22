// Purpose: Defines routes for managing candidates.
// This file sets up the API endpoints for creating, retrieving, updating, and deleting candidates,
// and maps them to the corresponding controller functions.
import express from 'express';
import { getAll, getById, create, update, remove, getCandidatesByElection } from '../controllers/candidateController.js';
import multer from 'multer';

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Ensure unique filenames
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/', getAll);
router.get('/by-election/:electionid', getCandidatesByElection);
router.get('/:id', getById);
router.post('/', upload.single('profile_photo'), create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router; 