import UserRepository from '../repositories/UserRepository';
import ReportRepository from '../repositories/ReportRepository';

type RepoType = 'user' | 'report' | 'auth' | 'pet';

export default class RepositoryFactory {
  static create(type: RepoType) {
    switch (type) {
      case 'user':
        return new UserRepository(process.env.USERS_URL || 'http://localhost:3002');
      case 'auth':
        // Auth repository uses a dynamic require to avoid circular imports in some setups
        // AuthRepository is a thin axios wrapper that calls the auth service
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { default: AuthRepository } = require('../repositories/AuthRepository');
        return new AuthRepository(process.env.AUTH_URL || 'http://localhost:3001');

      case 'report':
      case 'pet':
        // Reportes / mascotas service
        return new ReportRepository(process.env.REPORTS_URL || process.env.PETS_URL || 'http://localhost:3003');

      default:
        throw new Error('Tipo de repositorio no soportado: ' + type);
    }
  }
}
