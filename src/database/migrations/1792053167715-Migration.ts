import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames "posts" to "articles" (keeping existing rows) and adds the
 * slug/description columns. Constraint names match what TypeORM generates
 * for the "articles" table so later migration:generate runs stay clean.
 */
export class Migration1792053167715 implements MigrationInterface {
  name = 'Migration1792053167715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" RENAME TO "articles"`);
    await queryRunner.query(
      `ALTER TABLE "articles" RENAME CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" TO "PK_0a6e2c450d83e0b6052c2793334"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" RENAME CONSTRAINT "FK_312c63be865c81b922e39c2475e" TO "FK_6515da4dff8db423ce4eb841490"`,
    );

    // Articles must have an author; posts without one cannot be kept.
    await queryRunner.query(`DELETE FROM "articles" WHERE "author_id" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "author_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `UPDATE "articles" SET "content" = '' WHERE "content" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "content" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "articles" ADD "description" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "description" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "articles" ADD "slug" character varying`,
    );
    await queryRunner.query(
      `UPDATE "articles" SET "slug" = 'article-' || "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "slug" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370"`,
    );
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "content" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "author_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" RENAME CONSTRAINT "FK_6515da4dff8db423ce4eb841490" TO "FK_312c63be865c81b922e39c2475e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" RENAME CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" TO "PK_2829ac61eff60fcec60d7274b9e"`,
    );
    await queryRunner.query(`ALTER TABLE "articles" RENAME TO "posts"`);
  }
}
