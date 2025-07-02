import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddOwnerIdToProperties1749222153538 implements MigrationInterface {
    name = 'AddOwnerIdToProperties1749222153538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla properties existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'properties'
            );
        `);

        if (tableExists[0].exists) {
            // Verificar si la columna owner_id ya existe
            const columnExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'properties' AND column_name = 'owner_id'
                );
            `);

            if (!columnExists[0].exists) {
                // Agregar la columna owner_id
                await queryRunner.query(`ALTER TABLE "properties" ADD "owner_id" integer NOT NULL`);

                // Crear la foreign key
                await queryRunner.createForeignKey("properties", new TableForeignKey({
                    columnNames: ["owner_id"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "users",
                    onDelete: "CASCADE"
                }));
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla properties existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'properties'
            );
        `);

        if (tableExists[0].exists) {
            // Verificar si la columna owner_id existe
            const columnExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'properties' AND column_name = 'owner_id'
                );
            `);

            if (columnExists[0].exists) {
                // Eliminar la foreign key
                const table = await queryRunner.getTable("properties");
                const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("owner_id") !== -1);
                if (foreignKey) {
                    await queryRunner.dropForeignKey("properties", foreignKey);
                }

                // Eliminar la columna
                await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "owner_id"`);
            }
        }
    }
} 