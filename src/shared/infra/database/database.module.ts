import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source.js';
import { DATA_SOURCE } from './database.tokens.js';
import { TypeOrmUnitOfWork } from './typeorm-unit-of-work.js';

@Global()
@Module({
  providers: [
    {
      provide: DATA_SOURCE,
      useFactory: () => new DataSource(dataSourceOptions).initialize(),
    },
    TypeOrmUnitOfWork,
  ],
  exports: [DATA_SOURCE, TypeOrmUnitOfWork],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async onApplicationShutdown() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
