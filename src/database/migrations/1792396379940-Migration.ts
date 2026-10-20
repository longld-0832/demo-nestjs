import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792396379940 implements MigrationInterface {
  name = 'Migration1792396379940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_766eaf03c57b40f88a205e0c7e" ON "articles" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6515da4dff8db423ce4eb84149" ON "articles" ("author_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6515da4dff8db423ce4eb84149"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_766eaf03c57b40f88a205e0c7e"`,
    );
  }
}
