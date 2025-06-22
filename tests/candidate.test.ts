import request from 'supertest';
import express from 'express';
import * as candidateController from '../controllers/candidateController.js';
import * as candidateModel from '../models/candidateModel.js';

jest.mock('../models/candidateModel.js');

const app = express();
app.use(express.json());

app.get('/api/candidates', candidateController.getAll);
app.get('/api/candidates/:id', candidateController.getById);
app.post('/api/candidates', candidateController.create);
app.put('/api/candidates/:id', candidateController.update);
app.delete('/api/candidates/:id', candidateController.remove);

describe('Candidate API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get all candidates', async () => {
        const mockCandidates = [
            { cid: 1, name: 'Alice Smith', party: 'Party A' },
            { cid: 2, name: 'Bob Jones', party: 'Party B' }
        ];
        (candidateModel.getAll as jest.Mock).mockResolvedValue([mockCandidates]);
        const res = await request(app).get('/api/candidates');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockCandidates);
        expect(candidateModel.getAll).toHaveBeenCalled();
    });

    it('should get a candidate by ID', async () => {
        const mockCandidate = { cid: 1, name: 'Alice Smith', party: 'Party A' };
        (candidateModel.getById as jest.Mock).mockResolvedValue([[mockCandidate]]);
        const res = await request(app).get('/api/candidates/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockCandidate);
        expect(candidateModel.getById).toHaveBeenCalledWith(1);
    });

    it('should create a new candidate', async () => {
        (candidateModel.create as jest.Mock).mockResolvedValue([{ insertId: 1 }]);
        const res = await request(app)
            .post('/api/candidates')
            .send({ name: 'Alice Smith', party: 'Party A' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('cid', 1);
    });

    it('should update a candidate', async () => {
        (candidateModel.update as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app)
            .put('/api/candidates/1')
            .send({ name: 'Alice Johnson', party: 'Party B' });
        expect(res.statusCode).toBe(200);
        expect(candidateModel.update).toHaveBeenCalledWith(1, { name: 'Alice Johnson', party: 'Party B' });
    });

    it('should delete a candidate', async () => {
        (candidateModel.remove as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app).delete('/api/candidates/1');
        expect(res.statusCode).toBe(200);
        expect(candidateModel.remove).toHaveBeenCalledWith(1);
    });
}); 