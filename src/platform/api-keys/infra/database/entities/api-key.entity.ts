import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('api_key')
@Index('uq_api_key_key_hash', ['key_hash'], { unique: true })
export class ApiKeyEntity {
  @PrimaryColumn('uuid', { primaryKeyConstraintName: 'pk_api_key' })
  api_key_id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  key_prefix!: string;

  @Column('text')
  key_hash!: string;

  @Column('boolean')
  is_active!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_used_at!: Date | null;

  @Column('uuid')
  created_by!: string;

  @Column('timestamptz')
  created_at!: Date;

  @Column('timestamptz')
  updated_at!: Date;
}
