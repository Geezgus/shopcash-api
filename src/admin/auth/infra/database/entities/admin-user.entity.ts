import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { AdminRole } from '@admin/auth/domain/types/admin-role.js';

@Entity('admin_user')
@Index('uq_admin_user_email', ['email'], { unique: true })
export class AdminUserEntity {
  @PrimaryColumn('uuid', { primaryKeyConstraintName: 'pk_admin_user' })
  admin_user_id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  email!: string;

  @Column('text')
  role!: AdminRole;

  @Column('boolean')
  is_active!: boolean;

  @Column('text')
  password_hash!: string;

  @Column('text')
  password_salt!: string;

  @Column('text')
  password_algorithm!: string;

  @Column('timestamptz')
  created_at!: Date;

  @Column('timestamptz')
  updated_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;
}
