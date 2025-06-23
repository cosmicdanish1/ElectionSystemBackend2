// Purpose: Controller for Vote operations.
// This file contains functions that handle the business logic for vote-related API requests.
// It interacts with the vote model to perform CRUD operations (Create, Read, Update, Delete) on vote data,
// and sends appropriate responses back to the client.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllVotes, getById as getVoteById, create as createVote, update as updateVote, remove as removeVote } from '../models/voteModel.js';
import pool from '../config/database.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getAllVotes();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getVoteById(Number(req.params.id));
        if ((rows as any).length === 0) return res.status(404).json({ message: 'Vote not found' });
        res.json((rows as any)[0]);
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [result] = await createVote(req.body);
        res.status(201).json({ id: (result as any).insertId, ...req.body });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'You have already voted in this election.' });
        } else {
            next(err);
        }
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateVote(Number(req.params.id), req.body);
        res.json({ message: 'Vote updated' });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeVote(Number(req.params.id));
        res.json({ message: 'Vote deleted' });
    } catch (err) {
        next(err);
    }
};

// Leaderboard: Get candidates with vote counts for a given election
export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const electionId = req.params.electionid;
        const [rows] = await pool.query(
            `SELECT c.cid, c.name, c.partyname, COUNT(v.voteid) as votes
             FROM candidates c
             LEFT JOIN votes v ON c.cid = v.candidateid
             WHERE c.electionid = ?
             GROUP BY c.cid, c.name, c.partyname
             ORDER BY votes DESC`,
            [electionId]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}; 