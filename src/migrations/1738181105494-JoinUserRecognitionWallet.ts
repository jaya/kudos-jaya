import { MigrationInterface, QueryRunner } from "typeorm";

export class JoinUserRecognitionWallet1738181105494 implements MigrationInterface {
    name = 'JoinUserRecognitionWallet1738181105494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "FK_1e89f1fd137dc7fea7242377e25" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wallet"
            ADD CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "recognition"
            ADD CONSTRAINT "FK_cb3d242db49f14bb3a835b60584" FOREIGN KEY ("fromId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "recognition" DROP CONSTRAINT "FK_cb3d242db49f14bb3a835b60584"
        `);
        await queryRunner.query(`
            ALTER TABLE "wallet" DROP CONSTRAINT "FK_9bf56f7989a7e5717c92221cce0"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "FK_1e89f1fd137dc7fea7242377e25"
        `);
    }

}
