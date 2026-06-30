import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ReportRepository from '../../repositories/ReportRepository';

const mock = new MockAdapter(axios);

afterEach(() => mock.reset());

describe('ReportRepository', () => {
  const repo = new ReportRepository('http://localhost:3003/');

  it('constructor strips trailing slash', () => {
    expect((repo as any).baseUrl).toBe('http://localhost:3003');
  });

  it('findAll gets /reportes', async () => {
    mock.onGet('http://localhost:3003/reportes').reply(200, [{ id: 'r1' }]);
    const result = await repo.findAll();
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('findById gets /reportes/:id', async () => {
    mock.onGet('http://localhost:3003/reportes/r1').reply(200, { id: 'r1' });
    const result = await repo.findById('r1');
    expect(result).toEqual({ id: 'r1' });
  });
});
