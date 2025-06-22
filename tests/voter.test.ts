import request from 'supertest';
import express from 'express';
import * as voterController from '../controllers/voterController.js';
import * as voterModel from '../models/voterModel.js';

jest.mock('../models/voterModel.js');

const app = express();
app.use(express.json());

app.get('/api/voters', voterController.getAll);
app.get('/api/voters/:id', voterController.getById);
app.post('/api/voters', voterController.create);
app.put('/api/voters/:id', voterController.update);
app.delete('/api/voters/:id', voterController.remove);

describe('Voter API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get all voters', async () => {
        const mockVoters = [
            { vid: 1, name: 'John Doe', email: 'john@example.com' },
            { vid: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ];
        (voterModel.getAll as jest.Mock).mockResolvedValue([mockVoters]);
        const res = await request(app).get('/api/voters');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockVoters);
        expect(voterModel.getAll).toHaveBeenCalled();
    });

    it('should get a voter by ID', async () => {
        const mockVoter = { vid: 1, name: 'John Doe', email: 'john@example.com' };
        (voterModel.getById as jest.Mock).mockResolvedValue([[mockVoter]]);
        const res = await request(app).get('/api/voters/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockVoter);
        expect(voterModel.getById).toHaveBeenCalledWith(1);
    });

    it('should create a new voter', async () => {
        (voterModel.create as jest.Mock).mockResolvedValue([{ insertId: 1 }]);
        const res = await request(app)
            .post('/api/voters')
            .send({ name: 'John Doe', email: 'john@example.com' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('should update a voter', async () => {
        (voterModel.update as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app)
            .put('/api/voters/1')
            .send({ name: 'John Smith', email: 'john.smith@example.com' });
        expect(res.statusCode).toBe(200);
        expect(voterModel.update).toHaveBeenCalledWith(1, { name: 'John Smith', email: 'john.smith@example.com' });
    });

    it('should delete a voter', async () => {
        (voterModel.remove as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app).delete('/api/voters/1');
        expect(res.statusCode).toBe(200);
        expect(voterModel.remove).toHaveBeenCalledWith(1);
    });
}); 