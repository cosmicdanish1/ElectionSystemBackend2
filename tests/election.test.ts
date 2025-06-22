import request from 'supertest';
import express from 'express';
import * as electionController from '../controllers/electionController.js';
import * as electionModel from '../models/electionModel.js';

jest.mock('../models/electionModel.js');

const app = express();
app.use(express.json());

app.get('/api/elections', electionController.getAll);
app.get('/api/elections/:id', electionController.getById);
app.post('/api/elections', electionController.create);
app.put('/api/elections/:id', electionController.update);
app.delete('/api/elections/:id', electionController.remove);

describe('Election API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get all elections', async () => {
        const mockElections = [
            { electionid: 1, name: '2025 City Mayor Election', date: '2025-11-05' },
            { electionid: 2, name: '2025 School Board Election', date: '2025-12-01' }
        ];
        (electionModel.getAll as jest.Mock).mockResolvedValue([mockElections]);
        const res = await request(app).get('/api/elections');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockElections);
        expect(electionModel.getAll).toHaveBeenCalled();
    });

    it('should get an election by ID', async () => {
        const mockElection = { electionid: 1, name: '2025 City Mayor Election', date: '2025-11-05' };
        (electionModel.getById as jest.Mock).mockResolvedValue([[mockElection]]);
        const res = await request(app).get('/api/elections/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockElection);
        expect(electionModel.getById).toHaveBeenCalledWith(1);
    });

    it('should create a new election', async () => {
        (electionModel.create as jest.Mock).mockResolvedValue([{ insertId: 1 }]);
        const res = await request(app)
            .post('/api/elections')
            .send({ name: '2025 City Mayor Election', date: '2025-11-05' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('should update an election', async () => {
        (electionModel.update as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app)
            .put('/api/elections/1')
            .send({ name: '2026 City Mayor Election', date: '2026-11-05' });
        expect(res.statusCode).toBe(200);
        expect(electionModel.update).toHaveBeenCalledWith(1, { name: '2026 City Mayor Election', date: '2026-11-05' });
    });

    it('should delete an election', async () => {
        (electionModel.remove as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app).delete('/api/elections/1');
        expect(res.statusCode).toBe(200);
        expect(electionModel.remove).toHaveBeenCalledWith(1);
    });
}); 