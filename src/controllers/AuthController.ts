import { Request, Response } from 'express';
import RepositoryFactory from '../factories/RepositoryFactory';

const authRepo = RepositoryFactory.create('auth');

export default {
  async login(req: Request, res: Response) {
    try {
      const data = await authRepo.login(req.body);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const data = await authRepo.register(req.body);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
