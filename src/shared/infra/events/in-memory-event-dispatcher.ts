import type { DomainEventClass } from '@shared/application/services/event-dispatcher.js';
import { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import type { EventHandler } from '@shared/application/services/event-handler.js';
import type { DomainEvent } from '@shared/domain/domain-event.js';

/**
 * Dispatches events in-process. Handlers run concurrently and the dispatch awaits all of them,
 * so a failing handler fails the operation that dispatched the event.
 */
export class InMemoryEventDispatcher extends EventDispatcher {
  private readonly handlers = new Map<DomainEventClass, EventHandler<any>[]>();

  register<T extends DomainEvent>(event: DomainEventClass<T>, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.constructor as DomainEventClass) ?? [];
    await Promise.all(handlers.map((handler) => handler.handle(event)));
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.dispatch(event)));
  }
}
