import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddRolesAndUserRolesTables1749222153536 implements MigrationInterface {
    name = 'AddRolesAndUserRolesTables1749222153536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.createTable(
            new Table({
                name: 'roles',
                columns: [
                    {
                        name: 'uuid',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'character varying',
                        isUnique: true,
                    },
                ],
            }),
            true,
        );

        // Create user_roles table with foreign keys
        await queryRunner.createTable(
            new Table({
                name: 'user_roles',
                columns: [
                    {
                        name: 'user_id',
                        type: 'uuid',
                    },
                    {
                        name: 'role_uuid',
                        type: 'uuid',
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['user_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'users',
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['role_uuid'],
                        referencedColumnNames: ['uuid'],
                        referencedTableName: 'roles',
                        onDelete: 'CASCADE',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop user_roles table
        await queryRunner.dropTable('user_roles');

        // Drop roles table
        await queryRunner.dropTable('roles');
    }
}
