import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class migracionUno1748915457112 implements MigrationInterface {
    name = 'migracionUno1748915457112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "character varying",
                    },
                    {
                        name: "email",
                        type: "character varying",
                        isUnique: true,
                    },
                    {
                        name: "password",
                        type: "character varying",
                    },
                    {
                        name: "deletedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }
}
