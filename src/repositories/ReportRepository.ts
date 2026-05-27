// Cliente HTTP para comunicarse con el servicio de reportes.
import axios from 'axios';
// Interfaz de repositorio común.
import IRepository from './IRepository';

// Implementación del repositorio para reportes/mascotas.
export default class ReportRepository implements IRepository {
  private baseUrl: string;
  constructor(baseUrl: string) {
    // Normalizar la URL base evitando barra final.
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // Obtener todos los reportes.
  async findAll() {
    const url = `${this.baseUrl}/reportes`;
    const resp = await axios.get(url);
    return resp.data;
  }

  // Obtener un reporte por id.
  async findById(id: string) {
    const url = `${this.baseUrl}/reportes/${id}`;
    const resp = await axios.get(url);
    return resp.data;
  }
}
