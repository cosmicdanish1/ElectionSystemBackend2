// Purpose: Data model for Vote operations.
// This file defines functions for interacting with the 'votes' table in the database.
// It provides methods for retrieving all votes, getting a vote by ID, creating a new vote,
// updating an existing vote, and deleting a vote, encapsulating direct database queries.
import db from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export const getAll = () => db.query('SELECT * FROM votes');
export const getById = (id: number) => db.query('SELECT * FROM votes WHERE voteid = ?', [id]);
export const create = (data: any) => db.query<ResultSetHeader>('INSERT INTO votes SET ?', [data]);
export const update = (id: number, data: any) => db.query<ResultSetHeader>('UPDATE votes SET ? WHERE voteid = ?', [data, id]);
export const remove = (id: number) => db.query<ResultSetHeader>('DELETE FROM votes WHERE voteid = ?', [id]); 