import request from 'supertest';
import express from 'express';
import * as voteController from '../controllers/voteController.js';
import * as voteModel from '../models/voteModel.js';

jest.mock('../models/voteModel.js');

const app = express();
app.use(express.json());

app.get('/api/votes', voteController.getAll);
app.get('/api/votes/:id', voteController.getById);
app.post('/api/votes', voteController.create);
app.put('/api/votes/:id', voteController.update);
app.delete('/api/votes/:id', voteController.remove);

describe('Vote API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get all votes', async () => {
        const mockVotes = [
            { voteid: 1, voterid: 1, candidateid: 1, electionid: 1 },
            { voteid: 2, voterid: 2, candidateid: 2, electionid: 1 }
        ];
        (voteModel.getAll as jest.Mock).mockResolvedValue([mockVotes]);
        const res = await request(app).get('/api/votes');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockVotes);
        expect(voteModel.getAll).toHaveBeenCalled();
    });

    it('should get a vote by ID', async () => {
        const mockVote = { voteid: 1, voterid: 1, candidateid: 1, electionid: 1 };
        (voteModel.getById as jest.Mock).mockResolvedValue([[mockVote]]);
        const res = await request(app).get('/api/votes/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockVote);
        expect(voteModel.getById).toHaveBeenCalledWith(1);
    });

    it('should create a new vote', async () => {
        (voteModel.create as jest.Mock).mockResolvedValue([{ insertId: 1 }]);
        const res = await request(app)
            .post('/api/votes')
            .send({ voterid: 1, candidateid: 1, electionid: 1 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('should update a vote', async () => {
        (voteModel.update as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app)
            .put('/api/votes/1')
            .send({ voterid: 1, candidateid: 2, electionid: 1 });
        expect(res.statusCode).toBe(200);
        expect(voteModel.update).toHaveBeenCalledWith(1, { voterid: 1, candidateid: 2, electionid: 1 });
    });

    it('should delete a vote', async () => {
        (voteModel.remove as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
        const res = await request(app).delete('/api/votes/1');
        expect(res.statusCode).toBe(200);
        expect(voteModel.remove).toHaveBeenCalledWith(1);
    });
}); 