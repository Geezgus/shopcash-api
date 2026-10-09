export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Validates an access token and resolves the user it was issued to.
 */
export abstract class TokenValidator {
  abstract validateToken(token: string): Promise<AuthenticatedUser>;
}
