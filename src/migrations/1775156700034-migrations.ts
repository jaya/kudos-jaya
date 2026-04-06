import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1775156700034 implements MigrationInterface {
  name = 'Migrations1775156700034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "installation"
            ADD "monthlyKudosLimit" integer DEFAULT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "installation" DROP COLUMN "monthlyKudosLimit"
        `);
  }
}
