import type { AdminUserRepository } from '@admin/auth/domain/repositories/admin-user.repository.js';
import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';
import type { UseCase } from '@shared/application/usecase.js';

export class ListAdminUsersUseCase implements UseCase<void, ListAdminUsersOutput> {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async execute(): Promise<ListAdminUsersOutput> {
    const admins = await this.adminUserRepository.findAll();
    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));
  }
}

export type ListAdminUsersOutput = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}[];
