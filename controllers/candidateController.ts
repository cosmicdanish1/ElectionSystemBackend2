// Purpose: Controller for Candidate operations.
// This file contains functions that handle the business logic for candidate-related API requests.
// It interacts with the candidate model to perform CRUD operations (Create, Read, Update, Delete) on candidate data,
// and sends appropriate responses back to the client.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllCandidates, getById as getCandidateById, create as createCandidate, update as updateCandidate, remove as removeCandidate } from '../models/candidateModel.js';
import pool from '../config/database.js';
import { RowDataPacket } from 'mysql2';

interface Election extends RowDataPacket {
    electionid: number;
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getAllCandidates();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getCandidateById(Number(req.params.id));
        if ((rows as any).length === 0) return res.status(404).json({ message: 'Candidate not found' });
        res.json((rows as any)[0]);
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Expect ElectionType from UI, map to ElectionId
        const { ElectionType, ...payload } = req.body;
        if (!ElectionType) return res.status(400).json({ message: 'ElectionType required' });

        // find election id
        const [rows] = await pool.query<Election[]>('SELECT electionid FROM elections WHERE type = ? ORDER BY date DESC LIMIT 1', [ElectionType]);
        if (rows.length === 0) return res.status(400).json({ message: `No election of type ${ElectionType}` });

        payload.electionid = rows[0].electionid;

        const [result] = await createCandidate(payload);
        res.status(201).json({ cid: (result as any).insertId, ...payload, ElectionType });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateCandidate(Number(req.params.id), req.body);
        res.json({ message: 'Candidate updated' });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeCandidate(Number(req.params.id));
        res.json({ message: 'Candidate deleted' });
    } catch (err) {
        next(err);
    }
}; 