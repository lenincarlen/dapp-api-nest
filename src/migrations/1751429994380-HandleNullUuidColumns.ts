import { MigrationInterface, QueryRunner } from "typeorm";

export class HandleNullUuidColumns1751429994380 implements MigrationInterface {
    name = 'HandleNullUuidColumns1751429994380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);


        const propertiesOwnerFk = await queryRunner.query(`SELECT conname FROM pg_constraint WHERE conrelid = 'properties'::regclass AND conname = 'FK_797b76e2d11a5bf755127d1aa67';`);
        if (propertiesOwnerFk.length > 0) {
            await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67";`);
        }
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" DROP NOT NULL;`);
        await queryRunner.query(`UPDATE "properties" SET "owner_id" = '00000000-0000-0000-0000-000000000000' WHERE "owner_id" IS NULL;`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" SET DEFAULT uuid_generate_v4();`);
        if (propertiesOwnerFk.length > 0) {
            await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        }


        const tenantsUserFk = await queryRunner.query(`SELECT conname FROM pg_constraint WHERE conrelid = 'tenants'::regclass AND conname = 'FK_tenants_user_id';`);
        if (tenantsUserFk.length > 0) {
            await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "FK_tenants_user_id";`);
        }
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "user_id" DROP NOT NULL;`);
        await queryRunner.query(`UPDATE "tenants" SET "user_id" = '00000000-0000-0000-0000-000000000000' WHERE "user_id" IS NULL;`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "user_id" SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "user_id" SET DEFAULT uuid_generate_v4();`);
        if (tenantsUserFk.length > 0) {
            await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert properties.owner_id
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" DROP DEFAULT;`);

        // Revert tenants.user_id
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "user_id" SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "user_id" DROP DEFAULT;`);
    }

}
