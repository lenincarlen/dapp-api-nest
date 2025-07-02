import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTenantsTableOwnerIdToInteger1750996000000 implements MigrationInterface {
    name = 'UpdateTenantsTableOwnerIdToInteger1750996000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna owner_id existe y es UUID
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tenants' AND column_name = 'owner_id' AND data_type = 'uuid'
            );
        `);

        if (columnExists[0].exists) {
            // Cambiar el tipo de dato de UUID a integer
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE TEXT`);
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE INTEGER USING owner_id::integer`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna owner_id existe y es integer
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tenants' AND column_name = 'owner_id' AND data_type = 'integer'
            );
        `);

        if (columnExists[0].exists) {
            // Cambiar el tipo de dato de integer a UUID
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE TEXT`);
            await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" TYPE UUID USING owner_id::uuid`);
        }
    }
} 