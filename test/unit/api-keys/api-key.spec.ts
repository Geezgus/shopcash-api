import { uuidv7 } from 'uuidv7';
import { API_KEY_PREFIX, ApiKey } from '@platform/api-keys/domain/entities/api-key.js';
import { hashToken } from '@shared/crypto.js';
import { InvalidOperationException } from '@shared/domain/exceptions/invalid-operation.exception.js';

describe('ApiKey', () => {
  it('issues a prefixed key and stores only its hash', () => {
    const { apiKey, key } = ApiKey.issue('ERP', uuidv7());

    expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(apiKey.keyHash).toBe(hashToken(key));
    expect(key.startsWith(apiKey.keyPrefix)).toBe(true);
    expect(apiKey.keyPrefix.length).toBeLessThan(key.length);
  });

  it('can be deactivated only once', () => {
    const { apiKey } = ApiKey.issue('ERP', uuidv7());

    apiKey.deactivate();

    expect(apiKey.isActive).toBe(false);
    expect(() => apiKey.deactivate()).toThrow(InvalidOperationException);
  });
});
