import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1742907478847 implements MigrationInterface {
  name = 'Migrations1742907478847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "isAuditor" boolean
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "isAuditor"
        `);
  }
}
