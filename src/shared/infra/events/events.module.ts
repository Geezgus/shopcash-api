import { Global, Module } from '@nestjs/common';
import { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import { InMemoryEventDispatcher } from './in-memory-event-dispatcher.js';

@Global()
@Module({
  providers: [{ provide: EventDispatcher, useClass: InMemoryEventDispatcher }],
  exports: [EventDispatcher],
})
export class EventsModule {}
