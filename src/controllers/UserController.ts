import { Request, Response } from 'express';
import RepositoryFactory from '../factories/RepositoryFactory';

const userRepo = RepositoryFactory.create('user');

export default {
  async getAll(_req: Request, res: Response) {
    try {
      const data = await userRepo.findAll();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
