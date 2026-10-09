/**
 * Something that happened in the domain that other parts of the system may react to.
 */
export abstract class DomainEvent {
  readonly occurredAt = new Date();
}
