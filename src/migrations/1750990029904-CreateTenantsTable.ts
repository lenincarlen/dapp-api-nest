import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantsTable1750990029904 implements MigrationInterface {
    name = 'CreateTenantsTable1750990029904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla tenants ya existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'tenants'
            );
        `);

        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE tenants (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    phone VARCHAR(50) NOT NULL,
                    gov_id VARCHAR(100),
                    birth_date DATE,
                    income DECIMAL(10,2),
                    notes TEXT,
                    created_by INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_tenant_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tenants`);
    }
}
