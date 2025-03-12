import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1741629020740 implements MigrationInterface {
  name = 'Migrations1741629020740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "installation" (
                "teamId" character varying NOT NULL,
                "teamName" character varying NOT NULL,
                "tokenType" character varying NOT NULL,
                "isEnterpriseInstall" boolean NOT NULL,
                "appId" character varying NOT NULL,
                "authVersion" character varying NOT NULL,
                "enterprise" jsonb,
                "bot" jsonb NOT NULL,
                "giftCardApiToken" character varying,
                "defaultRecognitionChannel" character varying,
                "defaultAmount" numeric(10, 2) NOT NULL DEFAULT '100',
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT "PK_73abe801df7b9d8db869e961540" PRIMARY KEY ("teamId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "email" character varying,
                "teamId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "wallet" (
                "id" SERIAL NOT NULL,
                "ownerId" character varying NOT NULL,
                "balance" numeric(10, 2) NOT NULL DEFAULT '0',
                "teamId" character varying,
                CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "product" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "terms" character varying NOT NULL,
                "logo" character varying NOT NULL,
                "minValue" numeric(10, 2) NOT NULL DEFAULT '0',
                "maxValue" numeric(10, 2) NOT NULL DEFAULT '0',
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "transaction" (
                "id" SERIAL NOT NULL,
                "teamId" character varying NOT NULL,
                "walletId" integer NOT NULL,
                "amount" numeric(10, 2) NOT NULL DEFAULT '0',
                "productId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "recognition" (
                "id" SERIAL NOT NULL,
                "fromId" character varying NOT NULL,
                "fromName" character varying NOT NULL,
                "toId" character varying NOT NULL,
                "toName" character varying NOT NULL,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "teamId" character varying,
                CONSTRAINT "PK_09addd02f2343e4e7abbce17a37" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "FK_1e89f1fd137dc7fea7242377e25" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "FK_ddda31492d97b4abc56e646d938" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_f5dae9083816fb4972344a99c9b" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_fd965536176f304a7dd64937165" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_006bc1118b7ec4998bef80c93dc" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_2616d36637552752058e1ecf82a" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_cb3d242db49f14bb3a835b60584" FOREIGN KEY ("fromId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_cb3d242db49f14bb3a835b60584"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_2616d36637552752058e1ecf82a"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_006bc1118b7ec4998bef80c93dc"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_fd965536176f304a7dd64937165"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d"
        `);
    await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "FK_f5dae9083816fb4972344a99c9b"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet" DROP CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet" DROP CONSTRAINT "FK_ddda31492d97b4abc56e646d938"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "FK_1e89f1fd137dc7fea7242377e25"
        `);
    await queryRunner.query(`
            DROP TABLE "recognition"
        `);
    await queryRunner.query(`
            DROP TABLE "transaction"
        `);
    await queryRunner.query(`
            DROP TABLE "product"
        `);
    await queryRunner.query(`
            DROP TABLE "wallet"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TABLE "installation"
        `);
  }
}
