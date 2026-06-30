// jest.mock is hoisted — all mock fns must be defined INSIDE the factory,
// then accessed via jest.requireMock to avoid the "const before init" problem.
jest.mock('../../factories/RepositoryFactory', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockReturnValue({
      login: jest.fn(),
      register: jest.fn(),
    }),
  },
}));

import { Request, Response } from 'express';
import AuthController from '../../controllers/AuthController';

const mockRepo = (jest.requireMock('../../factories/RepositoryFactory') as any).default.create();
const mockLogin = mockRepo.login as jest.Mock;
const mockRegister = mockRepo.register as jest.Mock;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

beforeEach(() => jest.clearAllMocks());

describe('AuthController.login', () => {
  it('returns data on success', async () => {
    mockLogin.mockResolvedValue({ token: 'tok' });
    const req = { body: { email: 'a@b.com' } } as Request;
    const res = makeRes();
    await AuthController.login(req, res);
    expect(res.json).toHaveBeenCalledWith({ token: 'tok' });
  });

  it('returns 500 on error', async () => {
    mockLogin.mockRejectedValue(new Error('fail'));
    const req = { body: {} } as Request;
    const res = makeRes();
    await AuthController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});

describe('AuthController.register', () => {
  it('returns data on success', async () => {
    mockRegister.mockResolvedValue({ id: '1' });
    const req = { body: { email: 'a@b.com' } } as Request;
    const res = makeRes();
    await AuthController.register(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: '1' });
  });

  it('returns 500 on error', async () => {
    mockRegister.mockRejectedValue(new Error('fail'));
    const req = { body: {} } as Request;
    const res = makeRes();
    await AuthController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});
