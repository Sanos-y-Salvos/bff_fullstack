// All mock fns defined inside the factories to avoid the jest-hoist / const-before-init problem.
jest.mock('express', () => {
  const listen = jest.fn((port: number, cb: () => void) => { cb(); return {}; });
  const use = jest.fn();
  const app = { use, listen };
  const e = jest.fn(() => app) as any;
  e.Router = jest.fn(() => ({ all: jest.fn(), use: jest.fn() }));
  return { __esModule: true, default: e, __app: app };
});

jest.mock('dotenv', () => ({ __esModule: true, default: { config: jest.fn() } }));

jest.mock('../routes/routes', () => ({ __esModule: true, default: {} }));

describe('index.ts — server startup', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    require('../index');
  });

  afterAll(() => consoleSpy.mockRestore());

  it('mounts /api routes on the express app', () => {
    const { __app: app } = jest.requireMock('express') as any;
    expect(app.use).toHaveBeenCalledWith('/api', expect.anything());
  });

  it('listens on port 3000 and logs startup message', () => {
    const { __app: app } = jest.requireMock('express') as any;
    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('listening on port'));
  });
});
