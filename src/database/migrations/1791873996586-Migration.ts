import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1791873996586 implements MigrationInterface {
  name = 'Migration1791873996586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "attachable_type" character varying NOT NULL, "attachable_id" uuid NOT NULL, "url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer NOT NULL, CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_418b716a9043b7a66cfa8d22db" ON "attachments" ("attachable_type", "attachable_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_418b716a9043b7a66cfa8d22db"`,
    );
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
