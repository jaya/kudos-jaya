import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1763059967342 implements MigrationInterface {
  name = 'Migrations1763059967342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product"
            ADD "isActive" boolean NOT NULL DEFAULT true
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "isActive"
        `);
  }
}
