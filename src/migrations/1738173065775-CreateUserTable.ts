import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1738173065775 implements MigrationInterface {
  name = 'CreateUserTable1738173065775';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            ALTER TABLE "user"
            ADD CONSTRAINT "FK_1e89f1fd137dc7fea7242377e25" FOREIGN KEY ("teamId") REFERENCES "installation"("teamId") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "FK_1e89f1fd137dc7fea7242377e25"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
  }
}
