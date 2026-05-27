// Importa los repositorios concretos que la fábrica puede crear.
import UserRepository from '../repositories/UserRepository';
import ReportRepository from '../repositories/ReportRepository';

// Tipo union que representa los identificadores de repositorio soportados.
type RepoType = 'user' | 'report' | 'auth' | 'pet';

// Clase fábrica que crea instancias de repositorios según el tipo pedido.
export default class RepositoryFactory {
  static create(type: RepoType) {
    switch (type) {
      case 'user':
        // Crear UserRepository pasando la URL del servicio de usuarios.
        return new UserRepository(process.env.USERS_URL || 'http://localhost:3002');
      case 'auth':
        // En lugar de importar estáticamente AuthRepository, se hace un require dinámico
        // para evitar posibles dependencias circulares en ciertos escenarios.
        // AuthRepository es un wrapper que delega peticiones al servicio de autenticación.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { default: AuthRepository } = require('../repositories/AuthRepository');
        return new AuthRepository(process.env.AUTH_URL || 'http://localhost:3001');

      case 'report':
      case 'pet':
        // Tanto 'report' como 'pet' usan el mismo repositorio (ReportRepository).
        // Priorizar REPORTS_URL, luego PETS_URL, luego un fallback local.
        return new ReportRepository(process.env.REPORTS_URL || process.env.PETS_URL || 'http://localhost:3003');

      default:
        // Si se pide un tipo no soportado, lanzar un error claro.
        throw new Error('Tipo de repositorio no soportado: ' + type);
    }
  }
}
