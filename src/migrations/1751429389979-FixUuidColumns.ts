import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUuidColumns1751429389979 implements MigrationInterface {
    name = 'FixUuidColumns1751429389979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing foreign key constraints on user_roles and properties
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "FK_797b76e2d11a5bf755127d1aa67"`);

        // 1. Handle 'users' table: Change 'id' from SERIAL to UUID and remove 'uuid' column
        // Add a temporary UUID column to users
        await queryRunner.query(`ALTER TABLE "users" ADD "id_temp" uuid DEFAULT uuid_generate_v4()`);

        // Update existing rows to populate the new UUID column
        await queryRunner.query(`UPDATE "users" SET "id_temp" = uuid_generate_v4() WHERE "id_temp" IS NULL`);

        // Drop the old 'id' column (which was SERIAL)
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);

        // Rename the temporary UUID column to 'id'
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "id_temp" TO "id"`);

        // Set the new 'id' column as primary key and NOT NULL
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);

        // Remove the redundant 'uuid' column from 'users' if it exists
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "uuid"`);

        // 2. Handle 'user_roles' table: Change 'user_id' from integer to UUID
        // Add a temporary UUID column to user_roles
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "user_id_temp" uuid`);

        // Populate user_id_temp by joining with the new users.id
        await queryRunner.query(`UPDATE "user_roles" SET "user_id_temp" = "users"."id" FROM "users" WHERE "user_roles"."user_id" = "users"."id"`);

        // Drop the old 'user_id' column (which was integer)
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_7dcfc0df278c6c5885bd3db2099"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "user_id"`);

        // Rename the temporary UUID column to 'user_id'
        await queryRunner.query(`ALTER TABLE "user_roles" RENAME COLUMN "user_id_temp" TO "user_id"`);

        // Set the new 'user_id' column as NOT NULL
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET NOT NULL`);

        // Re-add primary key for user_roles
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_uuid")`);

        // 3. Handle 'tenants' table: Change 'id' from SERIAL to UUID
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "PK_53be67a04681c66b87ee27c9321"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id")`);

        // Update 'tenants' owner_id and user_id to uuid type if they were character varying
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "owner_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "owner_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "user_id" uuid`);

        // 4. Handle 'properties' table: Change 'owner_id' to UUID
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "owner_id"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "owner_id" uuid NOT NULL`);

        // Re-add foreign key constraints
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role_uuid" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Ensure uuid-ossp extension is created if not already
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Recreate user_roles table with correct primary key if it was dropped by previous auto-generated migration
        // This part is a safeguard, as the auto-generated migration might have dropped and recreated it incorrectly.
        // If the table already exists and is correct, these commands will do nothing or throw an error that can be ignored.
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_roles" (
                "user_id" uuid NOT NULL,
                "role_uuid" uuid NOT NULL,
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_uuid")
            )
        `);

        // Recreate foreign keys for user_roles if they were dropped
        await queryRunner.query(`
            ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role_uuid" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);

        // Recreate properties table foreign key if it was dropped
        await queryRunner.query(`
            ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);

        // Recreate tenants table foreign keys if they were dropped
        await queryRunner.query(`
            ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
        await queryRunner.query(`
            ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);

        // Ensure all UUID columns have a default value if they are new and not nullable
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "user_id" SET DEFAULT uuid_generate_v4()`);

        // Ensure all UUID columns are not null if they are new and not nullable
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "owner_id" SET NOT NULL`);
        // user_id in tenants can be null

        // Add primary key for user_roles if it was dropped
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_uuid")`);

        // Add foreign key for user_roles to users
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add foreign key for user_roles to roles
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role_uuid" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add foreign key for properties to users
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_properties_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add foreign key for tenants to users (owner_id)
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add foreign key for tenants to users (user_id)
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert foreign key constraints
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "FK_tenants_user_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "FK_tenants_owner_id"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "FK_properties_owner_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_user_roles_role_uuid"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_user_roles_user_id"`);

        // Revert 'properties' table: Change 'owner_id' back to integer
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "owner_id"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "owner_id" integer NOT NULL`);

        // Revert 'users' table: Change 'id' back to SERIAL and re-add 'uuid' column if it existed
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        // If 'uuid' column was present before, re-add it (assuming it was nullable)
        // await queryRunner.query(`ALTER TABLE "users" ADD "uuid" character varying`);

        // Revert 'tenants' table: Change 'id' back to SERIAL, 'owner_id' and 'user_id' back to integer
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "PK_53be67a04681c66b87ee27c9321"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id")`);

        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "owner_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "owner_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "user_id"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "user_id" integer`);

        // Revert 'user_roles' table: Change 'user_id' back to integer
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "user_id" integer NOT NULL,
                "role_uuid" uuid NOT NULL,
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_uuid")
            )
        `);

        // Re-add original foreign key constraints
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_0ea82c7b2302d7af0f8b789d797" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_tenants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
