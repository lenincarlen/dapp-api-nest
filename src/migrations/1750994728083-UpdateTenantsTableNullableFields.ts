import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTenantsTableNullableFields1750994728083 implements MigrationInterface {
    name = 'UpdateTenantsTableNullableFields1750994728083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hacer nullable los campos opcionales
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "gov_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "birth_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "income" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir los cambios
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "gov_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "birth_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "income" SET NOT NULL`);
    }
}
