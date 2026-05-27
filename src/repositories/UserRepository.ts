// Cliente HTTP utilizado para comunicarse con servicios externos.
import axios from 'axios';
// Interfaz que describe las operaciones del repositorio.
import IRepository from './IRepository';

// Repositorio concreto que implementa operaciones para usuarios.
export default class UserRepository implements IRepository {
  // `baseUrl` almacena la URL base del servicio de usuarios.
  private baseUrl: string;
  constructor(baseUrl: string) {
    // Normalizar la base removiendo cualquier barra final para evitar `//`.
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // Obtener todos los usuarios.
  async findAll() {
    // Construir la URL completa al endpoint de usuarios.
    const url = `${this.baseUrl}/api/users/admin/usuarios`;
    // Realizar la petición GET al servicio externo.
    const resp = await axios.get(url);
    // Devolver únicamente el body de la respuesta.
    return resp.data;
  }

  // Obtener un usuario por su id.
  async findById(id: string) {
    // Construir la URL con el id proporcionado.
    const url = `${this.baseUrl}/api/users/admin/usuarios/${id}`;
    const resp = await axios.get(url);
    // Retornar el body de la respuesta.
    return resp.data;
  }
}
