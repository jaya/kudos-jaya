import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalTransactionId1797267600000 implements MigrationInterface {
  name = 'AddExternalTransactionId1797267600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transaction"
      ADD "externalTransactionId" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transaction" DROP COLUMN "externalTransactionId"
    `);
  }
}
