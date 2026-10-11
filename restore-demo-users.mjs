import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import fs from "fs";

// Read MONGODB_URI from .env.local if not already in env
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("MONGODB_URI=")) {
      mongoUri = trimmed.substring("MONGODB_URI=".length).trim();
      // Remove surrounding quotes if present
      if ((mongoUri.startsWith('"') && mongoUri.endsWith('"')) || (mongoUri.startsWith("'") && mongoUri.endsWith("'"))) {
        mongoUri = mongoUri.slice(1, -1);
      }
      break;
    }
  }
}

if (!mongoUri) {
  console.error("MONGODB_URI not found!");
  process.exit(1);
}

async function restoreDemoUsers() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db("community-event-volunteer");
    const usersCollection = db.collection("users");

    const saltRounds = 10;
    const defaultPassword = "Password123";

    // 1. Organizer Demo Account
    const organizerEmail = "organizer@community.org";
    const organizerPasswordHash = await bcrypt.hash(defaultPassword, saltRounds);
    const organizerDoc = {
      name: "Community Organizer",
      email: organizerEmail,
      passwordHash: organizerPasswordHash,
      role: "organizer",
      updatedAt: new Date(),
    };

    const orgResult = await usersCollection.updateOne(
      { email: organizerEmail },
      {
        $set: organizerDoc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    console.log("Organizer account restored:", orgResult.upsertedCount > 0 ? "Created new" : "Updated existing");

    // 2. Volunteer Demo Account
    const volunteerEmail = "volunteer@community.org";
    const volunteerPasswordHash = await bcrypt.hash(defaultPassword, saltRounds);
    const volunteerDoc = {
      name: "Community Volunteer",
      email: volunteerEmail,
      passwordHash: volunteerPasswordHash,
      role: "volunteer",
      updatedAt: new Date(),
    };

    const volResult = await usersCollection.updateOne(
      { email: volunteerEmail },
      {
        $set: volunteerDoc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    console.log("Volunteer account restored:", volResult.upsertedCount > 0 ? "Created new" : "Updated existing");

    // 3. Verification
    const verifiedOrg = await usersCollection.findOne({ email: organizerEmail });
    const isOrgPassValid = await bcrypt.compare(defaultPassword, verifiedOrg.passwordHash);
    console.log("Verification - Organizer:", verifiedOrg.email, "Role:", verifiedOrg.role, "Password Match:", isOrgPassValid);

    const verifiedVol = await usersCollection.findOne({ email: volunteerEmail });
    const isVolPassValid = await bcrypt.compare(defaultPassword, verifiedVol.passwordHash);
    console.log("Verification - Volunteer:", verifiedVol.email, "Role:", verifiedVol.role, "Password Match:", isVolPassValid);

    if (isOrgPassValid && isVolPassValid) {
      console.log("ALL DEMO ACCOUNTS SUCCESSFULLY RESTORED AND VERIFIED!");
    } else {
      console.error("ERROR: Verification failed!");
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

restoreDemoUsers().catch((err) => {
  console.error("Restoration failed:", err);
  process.exit(1);
});
