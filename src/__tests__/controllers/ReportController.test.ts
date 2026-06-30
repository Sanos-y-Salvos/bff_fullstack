jest.mock('../../factories/RepositoryFactory', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockReturnValue({ findAll: jest.fn(), findById: jest.fn() }),
  },
}));

import { Request, Response } from 'express';
import ReportController from '../../controllers/ReportController';

const mockRepo = (jest.requireMock('../../factories/RepositoryFactory') as any).default.create();
const mockFindAll = mockRepo.findAll as jest.Mock;
const mockFindById = mockRepo.findById as jest.Mock;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

beforeEach(() => jest.clearAllMocks());

describe('ReportController.getAll', () => {
  it('returns data on success', async () => {
    mockFindAll.mockResolvedValue([{ id: 'r1' }]);
    const res = makeRes();
    await ReportController.getAll({} as Request, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 'r1' }]);
  });

  it('returns 500 on error', async () => {
    mockFindAll.mockRejectedValue(new Error('network'));
    const res = makeRes();
    await ReportController.getAll({} as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'network' });
  });
});

describe('ReportController.getById', () => {
  it('returns data on success', async () => {
    mockFindById.mockResolvedValue({ id: 'r1' });
    const req = { params: { id: 'r1' } } as unknown as Request;
    const res = makeRes();
    await ReportController.getById(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('returns 500 on error', async () => {
    mockFindById.mockRejectedValue(new Error('not found'));
    const req = { params: { id: 'r1' } } as unknown as Request;
    const res = makeRes();
    await ReportController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'not found' });
  });
});
