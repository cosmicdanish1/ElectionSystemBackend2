// Purpose: Controller for Voter operations.
// This file contains functions that handle the business logic for voter-related API requests.
// It interacts with the voter model to perform CRUD operations (Create, Read, Update, Delete) on voter data,
// and sends appropriate responses back to the client.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllVoters, getById as getVoterById, create as createVoter, update as updateVoter, remove as removeVoter, getByUserId } from '../models/voterModel.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getAllVoters();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getVoterById(Number(req.params.id));
        if ((rows as any).length === 0) return res.status(404).json({ message: 'Voter not found' });
        res.json((rows as any)[0]);
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [result] = await createVoter(req.body);
        res.status(201).json({ id: (result as any).insertId, ...req.body });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateVoter(Number(req.params.id), req.body);
        res.json({ message: 'Voter updated' });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeVoter(Number(req.params.id));
        res.json({ message: 'Voter deleted' });
    } catch (err) {
        next(err);
    }
};

export const getVoterByUserId = async (req: Request, res: Response) => {
    const { userid } = req.params;
    try {
        const [rows] = await getByUserId(Number(userid));
        if ((rows as any).length === 0) return res.status(404).json({ error: 'Not registered' });
        res.json((rows as any)[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: (err as Error).message });
    }
}; 