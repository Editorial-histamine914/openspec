import type { Detector } from "../types.js";

export const detectDatabases: Detector = async (ctx) => {
  const databases: string[] = [];
  const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };

  if (deps?.["prisma"] || deps?.["@prisma/client"]) {
    databases.push("Prisma");
  }
  if (deps?.["drizzle-orm"]) {
    databases.push("Drizzle");
  }
  if (deps?.["mongoose"]) {
    databases.push("Mongoose");
  }
  if (deps?.["pg"] || deps?.["postgres"]) {
    databases.push("PostgreSQL");
  }
  if (deps?.["mysql2"] || deps?.["mysql"]) {
    databases.push("MySQL");
  }
  if (deps?.["better-sqlite3"] || deps?.["sqlite3"]) {
    databases.push("SQLite");
  }
  if (deps?.["redis"] || deps?.["ioredis"]) {
    databases.push("Redis");
  }
  if (deps?.["typeorm"]) {
    databases.push("TypeORM");
  }
  if (deps?.["sequelize"]) {
    databases.push("Sequelize");
  }
  if (deps?.["knex"]) {
    databases.push("Knex");
  }

  return { databases };
};
