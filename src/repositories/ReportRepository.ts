import axios from 'axios';
import IRepository from './IRepository';

export default class ReportRepository implements IRepository {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async findAll() {
    const url = `${this.baseUrl}/reportes`;
    const resp = await axios.get(url);
    return resp.data;
  }

  async findById(id: string) {
    const url = `${this.baseUrl}/reportes/${id}`;
    const resp = await axios.get(url);
    return resp.data;
  }
}
