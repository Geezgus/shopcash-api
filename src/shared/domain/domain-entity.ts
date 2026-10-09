import { validateId } from '@shared/validation.js';

export abstract class DomainEntity {
  protected constructor(protected readonly _id: string) {
    validateId(this._id);
  }

  get id(): string {
    return this._id;
  }

  equals(other?: DomainEntity): boolean {
    if (!other) {
      return false;
    }

    return this.id === other.id;
  }
}
