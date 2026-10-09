import type { UseCase } from '@shared/application/usecase.js';
import type { UserRepository } from '@platform/users/domain/repositories/user.repository.js';

export class GetMeUseCase implements UseCase<GetMeInput, GetMeOutput> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetMeInput): Promise<GetMeOutput> {
    const user = await this.userRepository.getById(input.userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export interface GetMeInput {
  userId: string;
}

export interface GetMeOutput {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
