import RepositoryFactory from '../../factories/RepositoryFactory';
import UserRepository from '../../repositories/UserRepository';
import ReportRepository from '../../repositories/ReportRepository';

describe('RepositoryFactory', () => {
  it('creates UserRepository for "user"', () => {
    expect(RepositoryFactory.create('user')).toBeInstanceOf(UserRepository);
  });

  it('creates AuthRepository for "auth"', () => {
    const repo = RepositoryFactory.create('auth');
    expect(repo).toBeDefined();
    expect(typeof (repo as any).login).toBe('function');
  });

  it('creates ReportRepository for "report"', () => {
    expect(RepositoryFactory.create('report')).toBeInstanceOf(ReportRepository);
  });

  it('creates ReportRepository for "pet"', () => {
    expect(RepositoryFactory.create('pet')).toBeInstanceOf(ReportRepository);
  });

  it('throws for unsupported type', () => {
    expect(() => RepositoryFactory.create('unknown' as any)).toThrow('Tipo de repositorio no soportado');
  });
});
