import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRentsTable1750997000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "rents",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "contract_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "tenant_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "owner_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "property_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "amount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "monthly_maintenance",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "due_date",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "paid_at",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "paid", "late", "cancelled"],
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: "payment_method",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "previous_balance",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "total_due",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                ],
                foreignKeys: [
                    {
                        name: "FK_rents_contracts",
                        columnNames: ["contract_id"],
                        referencedTableName: "contracts",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        name: "FK_rents_tenants",
                        columnNames: ["tenant_id"],
                        referencedTableName: "tenants",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        name: "FK_rents_owners",
                        columnNames: ["owner_id"],
                        referencedTableName: "owners",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        name: "FK_rents_properties",
                        columnNames: ["property_id"],
                        referencedTableName: "properties",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("rents");
    }
} 