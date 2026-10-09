export interface Repository<T> {
  /**
   * Gets an entity by its id.
   * @throws a NotFound exception when it does not exist.
   */
  getById(id: string): Promise<T>;

  /**
   * Finds an entity by its id, returning null when it does not exist.
   */
  findById(id: string): Promise<T | null>;

  /**
   * Checks whether an entity with the given id exists.
   */
  exists(id: string): Promise<boolean>;

  /**
   * Persists the entity, inserting or updating it.
   */
  save(entity: T): Promise<T>;

  /**
   * Deletes an entity by its id.
   */
  delete(id: string): Promise<void>;
}
