import type { DomainEvent } from '@shared/domain/domain-event.js';

/**
 * Handles one type of domain event.
 */
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}
