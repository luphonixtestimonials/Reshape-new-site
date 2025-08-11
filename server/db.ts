
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle({ client: pool, schema });

// Initialize database with tables and sample data
export async function initializeDatabase() {
  try {
    // Create sample membership tiers
    const membershipTiers = [
      {
        name: "Access",
        monthlyPrice: 200.00,
        annualPrice: 2000.00,
        benefits: ["Full gym access", "Group fitness classes", "Locker room amenities", "Basic wellness services"],
        maxGuests: 0,
        personalTrainingIncluded: 0,
      },
      {
        name: "All Access", 
        monthlyPrice: 300.00,
        annualPrice: 3000.00,
        benefits: ["Multiple location access", "Personal training sessions", "Spa services included", "Nutrition consultations", "Guest privileges"],
        maxGuests: 2,
        personalTrainingIncluded: 2,
      },
      {
        name: "Executive",
        monthlyPrice: 500.00,
        annualPrice: 5000.00,
        benefits: ["VIP lounge access", "Unlimited personal training", "Concierge services", "Exclusive events", "Priority booking"],
        maxGuests: 5,
        personalTrainingIncluded: 999,
      }
    ];

    // Insert membership tiers
    for (const tier of membershipTiers) {
      await db.insert(schema.membershipTiers).values(tier).onConflictDoNothing();
    }

    // Create sample users
    const sampleUsers = [
      {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        userType: "member" as const,
        phone: "+1-555-0123"
      },
      {
        email: "jane.trainer@example.com",
        firstName: "Jane",
        lastName: "Smith",
        userType: "trainer" as const,
        phone: "+1-555-0124"
      },
      {
        email: "admin@reshape.com",
        firstName: "Admin",
        lastName: "User",
        userType: "admin" as const,
        phone: "+1-555-0125"
      }
    ];

    const insertedUsers = [];
    for (const user of sampleUsers) {
      const [insertedUser] = await db.insert(schema.users).values(user).onConflictDoNothing().returning();
      if (insertedUser) {
        insertedUsers.push(insertedUser);
      }
    }

    // Create sample member profile for John Doe
    const memberUser = insertedUsers.find(u => u?.email === "john.doe@example.com");
    const accessTier = await db.select().from(schema.membershipTiers).where(schema.membershipTiers.name.eq("Access")).limit(1);
    
    if (memberUser && accessTier.length > 0) {
      await db.insert(schema.memberProfiles).values({
        userId: memberUser.id,
        membershipTierId: accessTier[0].id,
        emergencyContact: "emergency@example.com",
        fitnessGoals: "General fitness and weight loss"
      }).onConflictDoNothing();
    }

    // Create sample trainer profile for Jane Smith
    const trainerUser = insertedUsers.find(u => u?.email === "jane.trainer@example.com");
    if (trainerUser) {
      await db.insert(schema.trainerProfiles).values({
        userId: trainerUser.id,
        specializations: ["Weight Training", "Cardio", "Nutrition"],
        certifications: "NASM-CPT, Nutrition Specialist",
        experienceYears: 5,
        hourlyRate: 75.00,
        bio: "Experienced personal trainer specializing in weight loss and strength training.",
        isAvailable: true
      }).onConflictDoNothing();
    }

    console.log("PostgreSQL database initialized with sample data");
  } catch (error) {
    console.error("Error initializing PostgreSQL database:", error);
  }
}
