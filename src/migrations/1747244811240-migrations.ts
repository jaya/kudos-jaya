import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1747244811240 implements MigrationInterface {
  name = 'Migrations1747244811240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "installation"
            ADD "clientApiKey" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "installation" DROP COLUMN "clientApiKey"
        `);
  }
}
