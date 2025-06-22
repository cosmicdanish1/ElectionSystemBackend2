// Purpose: Data model for Election operations.
// This file defines functions for interacting with the 'elections' table in the database.
// It provides methods for retrieving all elections, getting an election by ID, creating a new election,
// updating an existing election, and deleting an election, encapsulating direct database queries.
import db from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export const getAll = () => db.query('SELECT * FROM elections');
export const getById = (id: number) => db.query('SELECT * FROM elections WHERE electionid = ?', [id]);
export const create = (data: any) => db.query<ResultSetHeader>('INSERT INTO elections SET ?', [data]);
export const update = (id: number, data: any) => db.query<ResultSetHeader>('UPDATE elections SET ? WHERE electionid = ?', [data, id]);
export const remove = (id: number) => db.query<ResultSetHeader>('DELETE FROM elections WHERE electionid = ?', [id]); 