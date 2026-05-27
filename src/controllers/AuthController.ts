// Importa tipos para tipar las funciones del controlador.
import { Request, Response } from 'express';
// Importa la fábrica de repositorios para obtener el repositorio de auth.
import RepositoryFactory from '../factories/RepositoryFactory';

// Crear una instancia del repositorio de autenticación usando la fábrica.
const authRepo = RepositoryFactory.create('auth');

// Exporta el controlador con los handlers para login y register.
export default {
  // Handler para `login`.
  async login(req: Request, res: Response) {
    try {
      // Llamar al repositorio de auth pasando el body de la petición.
      const data = await authRepo.login(req.body);
      // Devolver la respuesta recibida del servicio de auth como JSON.
      res.json(data);
    } catch (err: any) {
      // En caso de error, devolver 500 con el mensaje.
      res.status(500).json({ error: err.message });
    }
  },

  // Handler para `register`.
  async register(req: Request, res: Response) {
    try {
      // Llamar al repositorio de auth para registrar un nuevo usuario.
      const data = await authRepo.register(req.body);
      // Devolver la respuesta del servicio de auth.
      res.json(data);
    } catch (err: any) {
      // Si ocurre un error, responder con código 500 y el mensaje.
      res.status(500).json({ error: err.message });
    }
  }
};
