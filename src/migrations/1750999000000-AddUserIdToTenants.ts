import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBalanceToOwnersTable implements MigrationInterface {
    name = 'AddBalanceToOwnersTable'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "owner" ADD "balance" decimal(12,2) NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "owner" DROP COLUMN "balance"`);
    }
}

export class UpdatePaymentTableUberModel implements MigrationInterface {
    name = 'UpdatePaymentTableUberModel'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cambia tipos y agrega columnas nuevas
        await queryRunner.query(`
            ALTER TABLE "payment"
            ALTER COLUMN "amount" TYPE decimal(12,2) USING amount::decimal,
            ALTER COLUMN "amount" SET NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD COLUMN IF NOT EXISTS "fee" decimal(12,2) NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "net_amount" decimal(12,2) NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "paid_at" timestamp NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "payment"
            DROP COLUMN IF EXISTS "fee",
            DROP COLUMN IF EXISTS "net_amount",
            DROP COLUMN IF EXISTS "paid_at";
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ALTER COLUMN "amount" TYPE integer USING amount::integer;
        `);
    }
} 