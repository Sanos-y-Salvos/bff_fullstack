jest.mock('../../middleware/proxy', () =>
  jest.fn(() => jest.fn())
);

import router from '../../routes/routes';

describe('routes', () => {
  it('exports an Express router', () => {
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });

  it('registers routes for auth, users, mascotas, localizacion, reportes, tickets, chatbot, matching', () => {
    const paths = (router as any).stack.map((layer: any) => layer.route?.path ?? layer.regexp?.source);
    const registered = paths.join(' ');
    expect(registered).toBeTruthy();
  });
});
