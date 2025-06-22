// Purpose: Data model for Voter operations.
// This file defines functions for interacting with the 'voters' table in the database.
// It provides methods for retrieving all voters, getting a voter by ID, creating a new voter,
// updating an existing voter, and deleting a voter, encapsulating direct database queries.
import db from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export const getAll = () => db.query('SELECT * FROM voters');
export const getById = (id: number) => db.query('SELECT * FROM voters WHERE vid = ?', [id]);
export const getByUserId = (userId: number) => db.query('SELECT * FROM voters WHERE userid = ?', [userId]);
export const create = (data: any) => db.query<ResultSetHeader>('INSERT INTO voters SET ?', [data]);
export const update = (id: number, data: any) => db.query<ResultSetHeader>('UPDATE voters SET ? WHERE vid = ?', [data, id]);
export const remove = (id: number) => db.query<ResultSetHeader>('DELETE FROM voters WHERE vid = ?', [id]);

// Get voter with user information
export const getVoterWithUser = (userId: number) => {
  return db.query(`
    SELECT v.*, u.name as UserName, u.email as UserEmail, u.role as UserRole
    FROM voters v
    LEFT JOIN users u ON v.userid = u.userid
    WHERE v.userid = ?
  `, [userId]);
}; 