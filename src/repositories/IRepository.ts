// Interfaz genérica que define las operaciones mínimas que debe implementar
// un repositorio en esta aplicación.
export default interface IRepository<T = any> {
  // findAll: debería devolver un array de elementos del tipo T.
  findAll(): Promise<T[]>;
  // findById: devuelve un elemento por su id o null si no existe.
  findById(id: string): Promise<T | null>;
}
