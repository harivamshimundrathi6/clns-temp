import { userOperations } from "./lib/firebase-db";
import bcrypt from "bcryptjs";

async function createDev() {
  try {
    const email = "hvsshari@gmail.com";
    const password = "9347216338";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    let existing = await userOperations.findUnique({ where: { email } });
    if (existing) {
      console.log("User exists, updating...");
      await userOperations.update(existing.id, {
        password: hashedPassword,
        role: "DEVELOPER",
        status: "ACTIVE"
      });
      console.log("Updated.");
    } else {
      console.log("Creating new user...");
      await userOperations.create({
        email,
        password: hashedPassword,
        name: "Developer",
        role: "DEVELOPER",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);
      console.log("Created.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createDev().then(() => process.exit(0));
