import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1743616078834 implements MigrationInterface {
  name = 'Migrations1743616078834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_2616d36637552752058e1ecf82a"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_cb3d242db49f14bb3a835b60584"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD "slackMessageId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD "slackChannelId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet" DROP CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "UQ_9bf56f7989a7e5717c92221cce0" UNIQUE ("ownerId")
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_48d95a74da7e53b6432dc1988e6" UNIQUE ("id", "teamId")
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "UQ_f7892009301b0e1afd3c24922df" UNIQUE ("id", "teamId")
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_d2855a4de88819f398fa528313d" FOREIGN KEY ("fromId", "teamId") REFERENCES "user"("id", "teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_18b2439cdea664bda761558cc0c" FOREIGN KEY ("toId", "teamId") REFERENCES "user"("id", "teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_18b2439cdea664bda761558cc0c"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_d2855a4de88819f398fa528313d"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet" DROP CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "UQ_f7892009301b0e1afd3c24922df"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_48d95a74da7e53b6432dc1988e6"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet" DROP CONSTRAINT "UQ_9bf56f7989a7e5717c92221cce0"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP COLUMN "slackChannelId"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP COLUMN "slackMessageId"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_cb3d242db49f14bb3a835b60584" FOREIGN KEY ("fromId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_2616d36637552752058e1ecf82a" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }
}
