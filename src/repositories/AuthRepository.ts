import axios from 'axios';

export default class AuthRepository {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(payload: any) {
    const url = `${this.baseUrl}/login`;
    const resp = await axios.post(url, payload);
    return resp.data;
  }

  async register(payload: any) {
    const url = `${this.baseUrl}/register`;
    const resp = await axios.post(url, payload);
    return resp.data;
  }
}
