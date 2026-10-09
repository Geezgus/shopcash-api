import type { DomainEntity } from '@shared/domain/domain-entity.js';
import type { Repository } from '@shared/domain/repository.js';

/**
 * Base in-memory repository for unit tests. Subclasses add the queries of their repository interface.
 */
export abstract class InMemoryRepository<T extends DomainEntity> implements Repository<T> {
  readonly items = new Map<string, T>();

  protected abstract notFound(id: string): Error;

  async getById(id: string): Promise<T> {
    const item = await this.findById(id);
    if (!item) throw this.notFound(id);
    return item;
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.items.has(id);
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  protected find(predicate: (item: T) => boolean): T | null {
    return [...this.items.values()].find(predicate) ?? null;
  }
}
