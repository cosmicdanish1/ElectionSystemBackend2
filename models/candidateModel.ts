// Purpose: Data model for Candidate operations.
// This file defines functions for interacting with the 'candidates' table in the database.
// It provides methods for retrieving all candidates, getting a candidate by ID, creating a new candidate,
// updating an existing candidate, and deleting a candidate, encapsulating direct database queries.
import db from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export const getAll = () => db.query('SELECT * FROM candidates');
export const getById = (id: number) => db.query('SELECT * FROM candidates WHERE cid = ?', [id]);
export const create = (data: any) => db.query<ResultSetHeader>('INSERT INTO candidates SET ?', [data]);
export const update = (id: number, data: any) => db.query<ResultSetHeader>('UPDATE candidates SET ? WHERE cid = ?', [data, id]);
export const remove = (id: number) => db.query<ResultSetHeader>('DELETE FROM candidates WHERE cid = ?', [id]); 