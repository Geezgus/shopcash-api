import { DomainEvent } from '@shared/domain/domain-event.js';

export class PasswordResetRequestedEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    readonly userName: string,
    readonly userEmail: string,
    /** Plain-text token: only the hash is stored, so this event is the one chance to deliver it. */
    readonly token: string,
    readonly expiresAt: Date,
  ) {
    super();
  }
}
