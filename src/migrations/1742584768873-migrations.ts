import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1742584768873 implements MigrationInterface {
  name = 'Migrations1742584768873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "installation"
            ADD "companyValues" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "installation" DROP COLUMN "companyValues"
        `);
  }
}
