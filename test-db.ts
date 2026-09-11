import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is missing");
}

const adapter = new PrismaPg({
  connectionString: url,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Testing PostgreSQL connection...");

  const result = await prisma.$queryRaw`SELECT NOW()`;

  console.log("DATABASE CONNECTION SUCCESS:");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("DATABASE CONNECTION FAILED:");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });