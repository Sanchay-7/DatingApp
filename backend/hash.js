import bcrypt from "bcryptjs";
console.log(await bcrypt.hash("Admin123!", 10));
