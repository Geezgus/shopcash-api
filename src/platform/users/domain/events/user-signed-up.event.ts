import { DomainEvent } from '@shared/domain/domain-event.js';

export class UserSignedUpEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    readonly userName: string,
    readonly userEmail: string,
  ) {
    super();
  }
}
