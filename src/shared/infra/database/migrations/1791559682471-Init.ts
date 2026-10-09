import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1791559682471 implements MigrationInterface {
  name = 'Init1791559682471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_user" ("admin_user_id" uuid NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "role" text NOT NULL, "is_active" boolean NOT NULL, "password_hash" text NOT NULL, "password_salt" text NOT NULL, "password_algorithm" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "pk_admin_user" PRIMARY KEY ("admin_user_id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_admin_user_email" ON "admin_user"  ("email") `);
    await queryRunner.query(
      `CREATE TABLE "api_key" ("api_key_id" uuid NOT NULL, "name" text NOT NULL, "key_prefix" text NOT NULL, "key_hash" text NOT NULL, "is_active" boolean NOT NULL, "last_used_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "pk_api_key" PRIMARY KEY ("api_key_id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_api_key_key_hash" ON "api_key"  ("key_hash") `);
    await queryRunner.query(
      `CREATE TABLE "user" ("user_id" uuid NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "avatar_url" text, "is_active" boolean NOT NULL, "is_verified" boolean NOT NULL, "password_hash" text NOT NULL, "password_salt" text NOT NULL, "password_algorithm" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "pk_user" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_user_email" ON "user"  ("email") `);
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("refresh_token_id" uuid NOT NULL, "user_id" uuid NOT NULL, "token_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "pk_refresh_token" PRIMARY KEY ("refresh_token_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "ix_refresh_token_user_id" ON "refresh_token"  ("user_id") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_refresh_token_token_hash" ON "refresh_token"  ("token_hash") `);
    await queryRunner.query(
      `CREATE TABLE "reset_password_token" ("reset_password_token_id" uuid NOT NULL, "user_id" uuid NOT NULL, "token_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "pk_reset_password_token" PRIMARY KEY ("reset_password_token_id"))`,
    );
    await queryRunner.query(`CREATE INDEX "ix_reset_password_token_user_id" ON "reset_password_token"  ("user_id") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_reset_password_token_token_hash" ON "reset_password_token"  ("token_hash") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "fk_refresh_token_user" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset_password_token" ADD CONSTRAINT "fk_reset_password_token_user" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reset_password_token" DROP CONSTRAINT "fk_reset_password_token_user"`);
    await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "fk_refresh_token_user"`);
    await queryRunner.query(`DROP INDEX "public"."uq_reset_password_token_token_hash"`);
    await queryRunner.query(`DROP INDEX "public"."ix_reset_password_token_user_id"`);
    await queryRunner.query(`DROP TABLE "reset_password_token"`);
    await queryRunner.query(`DROP INDEX "public"."uq_refresh_token_token_hash"`);
    await queryRunner.query(`DROP INDEX "public"."ix_refresh_token_user_id"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`DROP INDEX "public"."uq_user_email"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP INDEX "public"."uq_api_key_key_hash"`);
    await queryRunner.query(`DROP TABLE "api_key"`);
    await queryRunner.query(`DROP INDEX "public"."uq_admin_user_email"`);
    await queryRunner.query(`DROP TABLE "admin_user"`);
  }
}
