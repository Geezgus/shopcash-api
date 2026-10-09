import type { AuthenticatedAdmin } from '@admin/auth/application/services/admin-token-validator.js';
import type { AuthenticatedApiKey } from '@platform/api-keys/application/services/api-key-validator.js';
import type { AuthenticatedUser } from '@platform/users/application/services/token-validator.js';

declare global {
  namespace Express {
    interface Request {
      /** Set by AuthGuard. */
      user?: AuthenticatedUser;
      /** Set by AdminAuthGuard. */
      admin?: AuthenticatedAdmin;
      /** Set by ApiKeyGuard. */
      apiKey?: AuthenticatedApiKey;
    }
  }
}
