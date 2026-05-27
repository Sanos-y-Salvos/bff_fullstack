// Importa tipos para las funciones del controlador.
import { Request, Response } from 'express';
// Importa la fábrica para obtener el repositorio relacionado con mascotas/reportes.
import RepositoryFactory from '../factories/RepositoryFactory';

// Crear una instancia del repositorio de mascotas (alias 'pet').
const mascotaRepo = RepositoryFactory.create('pet');

// Exporta el controlador con handlers para obtener todos los reportes y por id.
export default {
  // Handler para obtener todos los reportes/mascotas.
  async getAll(_req: Request, res: Response) {
    try {
      // Llamar al repositorio para obtener todos los elementos.
      const data = await mascotaRepo.findAll();
      // Responder con los datos en formato JSON.
      res.json(data);
    } catch (err: any) {
      // Si hay un error, devolver 500 con el mensaje.
      res.status(500).json({ error: err.message });
    }
  },

  // Handler para obtener un reporte/mascota por su id.
  async getById(req: Request, res: Response) {
    try {
      // Llamar al repositorio pasando el parámetro `id` de la ruta.
      const data = await mascotaRepo.findById(req.params.id);
      // Enviar los datos obtenidos.
      res.json(data);
    } catch (err: any) {
      // En caso de error, devolver 500 con el mensaje.
      res.status(500).json({ error: err.message });
    }
  }
};
