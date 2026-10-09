import { AdminUserEntity } from '@admin/auth/infra/database/entities/admin-user.entity.js';
import { ApiKeyEntity } from '@platform/api-keys/infra/database/entities/api-key.entity.js';
import { RefreshTokenEntity } from '@platform/users/infra/database/entities/refresh-token.entity.js';
import { ResetPasswordTokenEntity } from '@platform/users/infra/database/entities/reset-password-token.entity.js';
import { UserEntity } from '@platform/users/infra/database/entities/user.entity.js';

/**
 * Every TypeORM entity of the application. Register new entities here.
 */
export const entities = [UserEntity, RefreshTokenEntity, ResetPasswordTokenEntity, AdminUserEntity, ApiKeyEntity];
