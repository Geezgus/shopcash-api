import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity.js';

@Entity('reset_password_token')
@Index('uq_reset_password_token_token_hash', ['token_hash'], { unique: true })
@Index('ix_reset_password_token_user_id', ['user_id'])
export class ResetPasswordTokenEntity {
  @PrimaryColumn('uuid', { primaryKeyConstraintName: 'pk_reset_password_token' })
  reset_password_token_id!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
    foreignKeyConstraintName: 'fk_reset_password_token_user',
  })
  user?: UserEntity;

  @Column('text')
  token_hash!: string;

  @Column('timestamptz')
  expires_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  used_at!: Date | null;

  @Column('timestamptz')
  created_at!: Date;
}
