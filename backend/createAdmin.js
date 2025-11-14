import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- !! CHANGE THESE DETAILS !! ---
  const adminEmail = "ew@gmail.com";
  const adminPassword = "123";
  const adminName = "Site Administrato";
  // ------------------------------------

  console.log("Starting to create admin user...");

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user with this email already exists.");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  console.log("Password hashed...");

  // Create the new admin user
  const newAdmin = await prisma.admin.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: "superadmin", // You can set the role here
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log(newAdmin);
}

main()
  .catch((e) => {
    console.error("Error creating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma connection
    await prisma.$disconnect();
  });