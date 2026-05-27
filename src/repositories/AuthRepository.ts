// Cliente HTTP para llamadas al servicio de autenticación.
import axios from 'axios';

// Repositorio que encapsula las llamadas al servicio de auth.
export default class AuthRepository {
  private baseUrl: string;
  constructor(baseUrl: string) {
    // Almacenar la URL base del servicio de autenticación.
    this.baseUrl = baseUrl;
  }

  // Realiza la llamada de login al servicio externo.
  async login(payload: any) {
    const url = `${this.baseUrl}/login`;
    const resp = await axios.post(url, payload);
    // Devolver el body de la respuesta.
    return resp.data;
  }

  // Realiza la llamada de registro al servicio externo.
  async register(payload: any) {
    const url = `${this.baseUrl}/register`;
    const resp = await axios.post(url, payload);
    return resp.data;
  }
}
