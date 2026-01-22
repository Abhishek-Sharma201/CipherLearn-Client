import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../../prisma/generated/prisma/client";
import { config } from "./env.config";
import * as fs from "fs";
import * as path from "path";

// Production-safe SSL configuration
const getCertPath = (): string => {
  // Prefer environment variable for flexibility in Docker/serverless
  if (process.env.AIVEN_CA_CERT_PATH) {
    return process.env.AIVEN_CA_CERT_PATH;
  }
  return path.join(__dirname, "../../certs/aiven.pem");
};

const getSslConfig = () => {
  const certPath = getCertPath();

  if (fs.existsSync(certPath)) {
    console.log("✅ SSL certificate found at:", certPath);
    return {
      ca: fs.readFileSync(certPath).toString(),
      rejectUnauthorized: true, // Properly validate the certificate
    };
  }

  console.warn("⚠️ SSL certificate not found at:", certPath);
  return undefined;
};

// Environment-based logging configuration
const getLogConfig = (): Prisma.LogLevel[] | Prisma.LogDefinition[] => {
  if (process.env.NODE_ENV === "development") {
    return [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "info", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ];
  }
  // Production: only log errors
  return [{ level: "error", emit: "stdout" }];
};

// Singleton pattern for Prisma client
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = (): PrismaClient => {
  const sslConfig = getSslConfig();

  // Create pg Pool with SSL configuration
  const pool = new Pool({
    connectionString: config.DB.URL,
    ssl: sslConfig,
  });

  // Create PrismaPg adapter with the pool
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: getLogConfig(),
  });

  // Only attach query logger in development
  if (process.env.NODE_ENV === "development") {
    // @ts-ignore
    client.$on("query", (e: Prisma.QueryEvent) => {
      console.log(`Query: ${e.query}`);
      console.log(`Duration: ${e.duration.toFixed(3)}ms`);
    });
  }

  return client;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Database connection helper
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database successfully.");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("Disconnected from the database.");
  } catch (error) {
    console.error("Error during disconnect:", error);
  }
};

