import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import UserRepository from '../../repositories/UserRepository';

const mock = new MockAdapter(axios);

afterEach(() => mock.reset());

describe('UserRepository', () => {
  const repo = new UserRepository('http://localhost:3002/');

  it('constructor strips trailing slash', () => {
    expect((repo as any).baseUrl).toBe('http://localhost:3002');
  });

  it('findAll gets /api/users/admin/usuarios', async () => {
    mock.onGet('http://localhost:3002/api/users/admin/usuarios').reply(200, [{ id: '1' }]);
    const result = await repo.findAll();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findById gets /api/users/admin/usuarios/:id', async () => {
    mock.onGet('http://localhost:3002/api/users/admin/usuarios/42').reply(200, { id: '42' });
    const result = await repo.findById('42');
    expect(result).toEqual({ id: '42' });
  });
});
