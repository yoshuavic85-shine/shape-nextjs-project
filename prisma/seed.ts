import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import { QUESTIONS } from "../lib/constants/questions";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Instrument v2: clear dependent rows then rebuild question bank
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();

  for (const q of QUESTIONS) {
    await prisma.question.create({
      data: {
        section: q.section,
        category: q.category,
        text: q.text,
        orderIndex: q.orderIndex,
        reverseKeyed: q.reverseKeyed,
        isAttentionCheck: q.isAttentionCheck,
      },
    });
  }

  console.log(`Seeded ${QUESTIONS.length} questions (instrument v2).`);

  const adminEmail = "admin@shapecompass.id";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existing) {
    const passwordHash = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        name: "Administrator",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("Admin user created: admin@shapecompass.id / admin123");
  } else {
    console.log("Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
