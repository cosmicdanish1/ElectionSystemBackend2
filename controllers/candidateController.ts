// Purpose: Controller for Candidate operations.
// This file contains functions that handle the business logic for candidate-related API requests.
// It interacts with the candidate model to perform CRUD operations (Create, Read, Update, Delete) on candidate data,
// and sends appropriate responses back to the client.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllCandidates, getById as getCandidateById, create as createCandidate, update as updateCandidate, remove as removeCandidate, getByElection as getCandidatesByElectionModel } from '../models/candidateModel.js';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Party extends RowDataPacket {
    partyid: number;
}

interface Election extends RowDataPacket {
    electionid: number;
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { electionid } = req.query;
        if (electionid) {
            // Custom query to join with elections and parties and filter by electionid
            const [rows] = await pool.query(`
                SELECT 
                    c.cid,
                    c.name,
                    c.gender,
                    c.dob,
                    c.aadharid,
                    c.partyid,
                    p.name AS partyname,
                    e.location_region AS place,
                    c.status,
                    c.is_verified
                FROM candidates c
                LEFT JOIN parties p ON c.partyid = p.partyid
                JOIN elections e ON c.electionid = e.electionid
                WHERE c.electionid = ?
            `, [electionid]);
            return res.json(rows);
        }
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
        const { ElectionType, electionid, partyname, ...payload } = req.body;

        // Debug log
        console.log('Received candidate data:', req.body, 'ElectionID:', electionid);

        // Add the file path to the payload if a file was uploaded
        if (req.file) {
            // Construct a URL path instead of a file system path
            payload.profile_photo_url = `/uploads/${req.file.filename}`;
        }

        // Step 1: Determine the electionid
        if (electionid) {
            payload.electionid = Number(electionid);
        } else if (ElectionType) {
            const [rows] = await pool.query<Election[]>('SELECT electionid FROM elections WHERE type = ? ORDER BY date DESC LIMIT 1', [ElectionType]);
            if (rows.length === 0) return res.status(400).json({ message: `No active election found for type ${ElectionType}` });
            payload.electionid = rows[0].electionid;
        } else {
            return res.status(400).json({ message: 'Election ID is required' });
        }

        // Step 2: Handle partyname (find or create party)
        if (partyname && partyname.trim() !== '') {
            const [parties] = await pool.query<Party[]>('SELECT partyid FROM parties WHERE name = ?', [partyname.trim()]);
            if (parties.length > 0) {
                payload.partyid = parties[0].partyid;
            } else {
                const [newParty] = await pool.query<ResultSetHeader>('INSERT INTO parties (name) VALUES (?)', [partyname.trim()]);
                payload.partyid = newParty.insertId;
            }
        } else {
            payload.partyid = null; // Independent candidate
        }

        const [result] = await createCandidate(payload);
        // @ts-ignore
        res.status(201).json({ cid: result.insertId, ...payload });
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

export const getCandidatesByElection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await getCandidatesByElectionModel(Number(req.params.electionid));
        res.json(rows);
    } catch (err) {
        next(err);
    }
}; 