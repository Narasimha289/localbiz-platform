require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Salon", slug: "salon" },
      { name: "Restaurant", slug: "restaurant" },
      { name: "Supermarket", slug: "supermarket" },
      { name: "Hotel", slug: "hotel" },
      { name: "Shopping", slug: "shopping" },
      { name: "Gym", slug: "gym" },
      { name: "Hospital", slug: "hospital" },
      { name: "Education", slug: "education" }
    ],
    skipDuplicates: true,
  });

  console.log("Categories added successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });