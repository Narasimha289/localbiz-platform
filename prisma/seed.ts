import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Salon", slug: "salon" },
      { name: "Restaurant", slug: "restaurant" },
      { name: "Supermarket", slug: "supermarket" },
      { name: "Hotel", slug: "hotel" },
      { name: "Shopping", slug: "shopping" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Categories seeded!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });