export interface AuthenticatedApiKey {
  id: string;
  name: string;
}

/**
 * Validates an API key, returning null when it is unknown or inactive.
 */
export abstract class ApiKeyValidator {
  abstract validate(key: string): Promise<AuthenticatedApiKey | null>;
}
