import { Inject, Injectable } from '@nestjs/common';
import { UnitOfWork } from '@shared/application/unit-of-work.js';
import { DataSource, EntityManager } from 'typeorm';
import { DATA_SOURCE } from './database.tokens.js';

/**
 * Runs the work inside a database transaction. Build repositories from the received EntityManager
 * so that all their reads and writes take part in the same transaction.
 */
@Injectable()
export class TypeOrmUnitOfWork extends UnitOfWork<EntityManager> {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    super();
  }

  execute<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}
