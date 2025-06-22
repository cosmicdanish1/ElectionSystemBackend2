// Purpose: Controller for Election operations.
// This file contains functions that handle the business logic for election-related API requests.
// It interacts with the election model to perform CRUD operations (Create, Read, Update, Delete) on election data,
// and sends appropriate responses back to the client.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllElections, getById as getElectionById, create as createElection, update as updateElection, remove as removeElection } from '../models/electionModel.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getAllElections();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getElectionById(Number(req.params.id));
        if ((rows as any).length === 0) return res.status(404).json({ message: 'Election not found' });
        res.json((rows as any)[0]);
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [result] = await createElection(req.body);
        res.status(201).json({ id: (result as any).insertId, ...req.body });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateElection(Number(req.params.id), req.body);
        res.json({ message: 'Election updated' });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeElection(Number(req.params.id));
        res.json({ message: 'Election deleted' });
    } catch (err) {
        next(err);
    }
}; 