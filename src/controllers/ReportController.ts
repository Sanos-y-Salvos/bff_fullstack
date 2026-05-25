import { Request, Response } from 'express';
import RepositoryFactory from '../factories/RepositoryFactory';

const mascotaRepo = RepositoryFactory.create('pet');

export default {
  async getAll(_req: Request, res: Response) {
    try {
      const data = await mascotaRepo.findAll();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await mascotaRepo.findById(req.params.id);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
