import type { DomainEvent } from '@shared/domain/domain-event.js';
import type { EventHandler } from './event-handler.js';

export type DomainEventClass<T extends DomainEvent = DomainEvent> = new (...args: any[]) => T;

/**
 * Registers event handlers and dispatches domain events to them.
 */
export abstract class EventDispatcher {
  abstract register<T extends DomainEvent>(event: DomainEventClass<T>, handler: EventHandler<T>): void;

  abstract dispatch(event: DomainEvent): Promise<void>;

  abstract dispatchAll(events: DomainEvent[]): Promise<void>;
}
