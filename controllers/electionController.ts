// Purpose: Controller for Election operations.
// This file contains functions that handle the business logic for election-related API requests.
// It interacts with the election model to perform CRUD operations (Create, Read, Update, Delete) on election data,
// and sends appropriate responses back to the client.
import { Request, Response, NextFunction } from 'express';
import { getAll as getAllElections, getById as getElectionById, create as createElection, update as updateElection, remove as removeElection } from '../models/electionModel.js';
import db from '../config/database.js';

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
        const [rows] = await db.query<any[]>(`
            SELECT 
                e.*,
                p.name as partyname,
                c.cid,
                c.name as candidate_name,
                c.symbol_url
            FROM elections e
            LEFT JOIN candidates c ON e.electionid = c.electionid
            LEFT JOIN parties p ON c.partyid = p.partyid
            WHERE e.electionid = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const electionResult = {
            electionid: rows[0].electionid,
            title: rows[0].title,
            type: rows[0].type,
            date: rows[0].date,
            location_region: rows[0].location_region,
            status: rows[0].status,
            candidates: rows[0].cid ? rows.map(row => ({
                cid: row.cid,
                name: row.candidate_name,
                partyname: row.partyname,
                symbol_url: row.symbol_url
            })) : []
        };

        res.json(electionResult);
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

export const getRelevantElections = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userid;
    // Get voter's state and nationality
    const [voterRows] = await db.query<any[]>(
      'SELECT state, nationality FROM voters WHERE userid = ?',
      [userId]
    );
    if (!voterRows.length) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    const { state, nationality } = voterRows[0];
    let elections;
    if (nationality === 'Indian') {
      // Indians see national and their state elections
      [elections] = await db.query<any[]>(
        `SELECT * FROM elections WHERE location_region = 'India' OR location_region = ?`,
        [state]
      );
    } else {
      // All others see all elections
      [elections] = await db.query<any[]>(
        `SELECT * FROM elections`
      );
    }
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}; 