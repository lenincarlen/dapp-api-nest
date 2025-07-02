import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTenantsTableOwnerId1750995000000 implements MigrationInterface {
    name = 'UpdateTenantsTableOwnerId1750995000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna created_by existe
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tenants' AND column_name = 'created_by'
            );
        `);

        if (columnExists[0].exists) {
            // Renombrar created_by a owner_id
            await queryRunner.query(`ALTER TABLE "tenants" RENAME COLUMN "created_by" TO "owner_id"`);

            // Cambiar el tipo de dato a TEXT primero, luego a UUID
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE TEXT`);
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE UUID USING owner_id::uuid`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna owner_id existe
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tenants' AND column_name = 'owner_id'
            );
        `);

        if (columnExists[0].exists) {
            // Cambiar el tipo de dato de vuelta a integer
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE TEXT`);
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE INTEGER USING owner_id::integer`);

            // Renombrar owner_id de vuelta a created_by
            await queryRunner.query(`ALTER TABLE "tenants" RENAME COLUMN "owner_id" TO "created_by"`);
        }
    }
} 