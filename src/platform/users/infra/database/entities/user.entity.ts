import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('user')
@Index('uq_user_email', ['email'], { unique: true })
export class UserEntity {
  @PrimaryColumn('uuid', { primaryKeyConstraintName: 'pk_user' })
  user_id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  email!: string;

  @Column({ type: 'text', nullable: true })
  avatar_url!: string | null;

  @Column('boolean')
  is_active!: boolean;

  @Column('boolean')
  is_verified!: boolean;

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
