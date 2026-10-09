import { DomainEntity } from './domain-entity.js';
import type { DomainEvent } from './domain-event.js';

export abstract class AggregateRoot extends DomainEntity {
  private readonly _events: DomainEvent[] = [];

  protected addEvent(event: DomainEvent) {
    this._events.push(event);
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._events];

    this._events.length = 0;

    return events;
  }
}
