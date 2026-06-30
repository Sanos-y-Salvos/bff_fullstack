jest.mock('../../factories/RepositoryFactory', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockReturnValue({ findAll: jest.fn() }),
  },
}));

import { Request, Response } from 'express';
import UserController from '../../controllers/UserController';

const mockRepo = (jest.requireMock('../../factories/RepositoryFactory') as any).default.create();
const mockFindAll = mockRepo.findAll as jest.Mock;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

beforeEach(() => jest.clearAllMocks());

describe('UserController.getAll', () => {
  it('returns data on success', async () => {
    mockFindAll.mockResolvedValue([{ id: '1' }]);
    const res = makeRes();
    await UserController.getAll({} as Request, res);
    expect(res.json).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('returns 500 on error', async () => {
    mockFindAll.mockRejectedValue(new Error('db error'));
    const res = makeRes();
    await UserController.getAll({} as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'db error' });
  });
});
