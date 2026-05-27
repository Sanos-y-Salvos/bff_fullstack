// Importa tipos para tipar los parámetros de las funciones del controlador.
import { Request, Response } from 'express';
// Importa la fábrica de repositorios para obtener el repositorio de usuarios.
import RepositoryFactory from '../factories/RepositoryFactory';

// Crear instancia del repositorio de usuarios.
const userRepo = RepositoryFactory.create('user');

// Exporta el controlador con el handler para obtener todos los usuarios.
export default {
  // Handler para obtener todos los usuarios.
  async getAll(_req: Request, res: Response) {
    try {
      // Llamar al repositorio para obtener la lista completa.
      const data = await userRepo.findAll();
      // Responder con los datos en formato JSON.
      res.json(data);
    } catch (err: any) {
      // Si hay un error, responder con 500 y el mensaje.
      res.status(500).json({ error: err.message });
    }
  }
};
