import { EventDispatcher } from '@shared/application/services/event-dispatcher.js';
import type { DomainEvent } from '@shared/domain/domain-event.js';

/**
 * Records dispatched events instead of handling them.
 */
export class FakeEventDispatcher extends EventDispatcher {
  readonly dispatched: DomainEvent[] = [];

  register(): void {}

  async dispatch(event: DomainEvent): Promise<void> {
    this.dispatched.push(event);
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    this.dispatched.push(...events);
  }

  ofType<T extends DomainEvent>(type: new (...args: any[]) => T): T[] {
    return this.dispatched.filter((event): event is T => event instanceof type);
  }
}
