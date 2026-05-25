export default interface IRepository<T = any> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
}
