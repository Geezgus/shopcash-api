import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity.js';

@Entity('refresh_token')
@Index('uq_refresh_token_token_hash', ['token_hash'], { unique: true })
@Index('ix_refresh_token_user_id', ['user_id'])
export class RefreshTokenEntity {
  @PrimaryColumn('uuid', { primaryKeyConstraintName: 'pk_refresh_token' })
  refresh_token_id!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id', foreignKeyConstraintName: 'fk_refresh_token_user' })
  user?: UserEntity;

  @Column('text')
  token_hash!: string;

  @Column('timestamptz')
  expires_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;

  @Column('timestamptz')
  created_at!: Date;
}
