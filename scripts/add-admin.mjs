// Adds an admin account. Usage:
//   npm run admin:add -- email@example.com "Strong Password" "Optional Name"
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run admin:add -- "email@example.com" "Strong Password" "Optional Name"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("[X] The password must be at least 8 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.error("[X] An admin with that email already exists.");
    process.exit(1);
  }
  const admin = await prisma.adminUser.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      name: name || email,
    },
  });
  console.log(`[OK] Admin created: ${admin.email} (${admin.name})`);
} finally {
  await prisma.$disconnect();
}
