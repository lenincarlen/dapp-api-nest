import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDefaultRoles1749222153537 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert default roles
        await queryRunner.query(`
            INSERT INTO roles (uuid, name) VALUES 
            ('550e8400-e29b-41d4-a716-446655440001', 'tenant'),
            ('550e8400-e29b-41d4-a716-446655440002', 'owner'),
            ('550e8400-e29b-41d4-a716-446655440003', 'admin')
            ON CONFLICT (name) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove default roles
        await queryRunner.query(`
            DELETE FROM roles WHERE name IN ('tenant', 'owner', 'admin')
        `);
    }

} 