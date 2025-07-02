import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContractsTable1750990695971 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si los tipos ENUM ya existen
        const contractStatusExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'contract_status'
            );
        `);

        const paymentMethodExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'payment_method_type'
            );
        `);

        if (!contractStatusExists[0].exists) {
            await queryRunner.query(`
                CREATE TYPE contract_status AS ENUM ('active', 'inactive', 'expired', 'terminated');
            `);
        }

        if (!paymentMethodExists[0].exists) {
            await queryRunner.query(`
                CREATE TYPE payment_method_type AS ENUM ('credit_card', 'bank_transfer', 'cash', 'other');
            `);
        }

        // Verificar si la tabla contracts ya existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'contracts'
            );
        `);

        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE contracts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    owner_id UUID NOT NULL,
                    tenant_id INTEGER NOT NULL,
                    property_id UUID NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    payment_due_date INTEGER NOT NULL,
                    security_deposit DECIMAL(10,2) NULL,
                    monthly_maintenance DECIMAL(10,2) NULL,
                    payment_method payment_method_type NOT NULL,
                    status contract_status DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_contract_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT fk_contract_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                    CONSTRAINT fk_contract_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
                )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS contracts`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_method_type`);
        await queryRunner.query(`DROP TYPE IF EXISTS contract_status`);
    }

}
