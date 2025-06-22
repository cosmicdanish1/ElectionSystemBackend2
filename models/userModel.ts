// Purpose: Data model for User operations.
// This file defines functions for interacting with the 'users' table in the database.
// It provides methods for retrieving all users, getting a user by ID, creating, updating, and deleting a user.
import db from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export const getAll = () => db.query('SELECT * FROM users');
export const getById = (id: number) => db.query('SELECT * FROM users WHERE userid = ?', [id]);
export const create = (data: any) => db.query<ResultSetHeader>('INSERT INTO users SET ?', [data]);
export const update = (id: number, data: any) => db.query<ResultSetHeader>('UPDATE users SET ? WHERE userid = ?', [data, id]);
export const remove = (id: number) => db.query<ResultSetHeader>('DELETE FROM users WHERE userid = ?', [id]); 