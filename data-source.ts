import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

const isTsNode = process.env.TS_NODE === 'true' || process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "mellolenin",
  database: process.env.DB_DATABASE || "dapp",
  entities: [isTsNode ? "src/**/entities/*.ts" : "dist/**/entities/*.js"],
  migrations: [isTsNode ? "src/migrations/*.ts" : "dist/migrations/*.js"],
  synchronize: true,
});