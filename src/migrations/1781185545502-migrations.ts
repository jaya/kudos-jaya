import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1781185545502 implements MigrationInterface {
  name = 'Migrations1781185545502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "isActive" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "isActive"
    `);
  }
}
