import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDistribution1738593025699 implements MigrationInterface {
  name = 'AddDistribution1738593025699';

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
            ALTER TABLE "wallet"
            ADD "teamId" character varying
        `);
    await queryRunner.query(`
        UPDATE "wallet" SET "teamId" = 'T033VJH10' where "teamId" IS NULL;
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD "teamId" character varying
        `);
    await queryRunner.query(`
            INSERT INTO "user" ("id", "name", "teamId")  
            SELECT DISTINCT "toId", "toName", 'T033VJH10' as "teamId"
            FROM "recognition"  
            WHERE "teamId" IS NULL
            and "toId" not in ('UDCFCCYLS', 'U01GUM70B6W', 'USVM7NSHL', 'ULEGM295W','U02MA739EF8')
            ORDER BY "toId";
            `);
    await queryRunner.query(`
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('UDCFCCYLS', 'Diana Horbatiuk', 'T033VJH10');
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('U01GUM70B6W', 'Fernando Ferreira', 'T033VJH10');
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('USVM7NSHL', 'Bruna', 'T033VJH10'); 
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('ULEGM295W', 'Solange Soares (ela/dela she/her)', 'T033VJH10'); 
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('U02MA739EF8', 'Andréia Berto', 'T033VJH10');
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('U9GR14W4A','Anderson Braz','T033VJH10');
            INSERT INTO "user" ("id", "name", "teamId") VALUES ('UQ87YBW77','Osmar Luz', 'UQ87YBW77');
            `);
    await queryRunner.query(`
        UPDATE "recognition" SET "teamId" = 'T033VJH10' where "teamId" IS NULL;
        `);

    await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ADD CONSTRAINT "FK_cb3d242db49f14bb3a835b60584" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_cb3d242db49f14bb3a835b60585" FOREIGN KEY ("fromId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_f5dae9083816fb4972344a99c9b" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_006bc1118b7ec4998bef80c93dc" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_cb3d242db49f14bb3a835b60584"
        `);
    await queryRunner.query(`
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_cb3d242db49f14bb3a835b60585"
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
            ALTER TABLE "recognition" DROP COLUMN "teamId"
        `);
    await queryRunner.query(`
            ALTER TABLE "wallet" DROP COLUMN "teamId"
        `);
    await queryRunner.query(`
            DROP TABLE "transaction"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TABLE "installation"
        `);
  }
}
