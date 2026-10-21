import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792479630081 implements MigrationInterface {
  name = 'Migration1792479630081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article_follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "article_id" uuid NOT NULL, CONSTRAINT "UQ_94dfe105a19ba713562c6aa5241" UNIQUE ("user_id", "article_id"), CONSTRAINT "PK_8a01df1af52bcfa82cfa351d899" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8ffe5124839afc2f799c9cd3b" ON "article_follows" ("article_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c6afe716f2efa35d9a803dd40" ON "articles" ("updated_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "article_follows" ADD CONSTRAINT "FK_f8ac7496bfb9afa11236b743913" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_follows" ADD CONSTRAINT "FK_e8ffe5124839afc2f799c9cd3b7" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_follows" DROP CONSTRAINT "FK_e8ffe5124839afc2f799c9cd3b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_follows" DROP CONSTRAINT "FK_f8ac7496bfb9afa11236b743913"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c6afe716f2efa35d9a803dd40"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8ffe5124839afc2f799c9cd3b"`,
    );
    await queryRunner.query(`DROP TABLE "article_follows"`);
  }
}
