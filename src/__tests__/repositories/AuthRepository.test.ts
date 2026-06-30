import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AuthRepository from '../../repositories/AuthRepository';

const mock = new MockAdapter(axios);

afterEach(() => mock.reset());

describe('AuthRepository', () => {
  const repo = new AuthRepository('http://localhost:3001');

  it('login posts to /login and returns data', async () => {
    mock.onPost('http://localhost:3001/login').reply(200, { token: 'abc' });
    const result = await repo.login({ email: 'a@b.com', password: '123' });
    expect(result).toEqual({ token: 'abc' });
  });

  it('register posts to /register and returns data', async () => {
    mock.onPost('http://localhost:3001/register').reply(201, { id: '1' });
    const result = await repo.register({ email: 'a@b.com', password: '123' });
    expect(result).toEqual({ id: '1' });
  });
});
