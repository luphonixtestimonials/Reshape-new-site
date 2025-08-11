
import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;

export async function initializeMongoDB() {
  try {
    // Create in-memory MongoDB instance for Replit compatibility
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('gymdata');
    
    console.log('Connected to MongoDB (in-memory)');
    
    // Initialize collections and sample data
    await initializeCollections();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function initializeCollections() {
  // Create membership tiers collection
  const membershipTiers = db.collection('membershipTiers');
  await membershipTiers.deleteMany({}); // Clear existing data
  
  const sampleTiers = [
    {
      name: "Access",
      monthlyPrice: 200.00,
      annualPrice: 2000.00,
      benefits: ["Full gym access", "Group fitness classes", "Locker room amenities", "Basic wellness services"],
      maxGuests: 0,
      personalTrainingIncluded: 0,
      createdAt: new Date()
    },
    {
      name: "All Access", 
      monthlyPrice: 300.00,
      annualPrice: 3000.00,
      benefits: ["Multiple location access", "Personal training sessions", "Spa services included", "Nutrition consultations", "Guest privileges"],
      maxGuests: 2,
      personalTrainingIncluded: 2,
      createdAt: new Date()
    },
    {
      name: "Executive",
      monthlyPrice: 500.00,
      annualPrice: 5000.00,
      benefits: ["VIP lounge access", "Unlimited personal training", "Concierge services", "Exclusive events", "Priority booking"],
      maxGuests: 5,
      personalTrainingIncluded: 999,
      createdAt: new Date()
    }
  ];
  
  await membershipTiers.insertMany(sampleTiers);
  
  // Create users collection
  const users = db.collection('users');
  await users.deleteMany({});
  
  const sampleUsers = [
    {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      userType: "member",
      phone: "+1-555-0123",
      createdAt: new Date()
    },
    {
      email: "jane.trainer@example.com",
      firstName: "Jane",
      lastName: "Smith",
      userType: "trainer",
      phone: "+1-555-0124",
      createdAt: new Date()
    },
    {
      email: "admin@reshape.com",
      firstName: "Admin",
      lastName: "User",
      userType: "admin",
      phone: "+1-555-0125",
      createdAt: new Date()
    }
  ];
  
  const insertedUsers = await users.insertMany(sampleUsers);
  
  // Create member profiles collection
  const memberProfiles = db.collection('memberProfiles');
  await memberProfiles.deleteMany({});
  
  const accessTier = await membershipTiers.findOne({ name: "Access" });
  const memberUser = await users.findOne({ email: "john.doe@example.com" });
  
  if (memberUser && accessTier) {
    await memberProfiles.insertOne({
      userId: memberUser._id,
      membershipTierId: accessTier._id,
      emergencyContact: "emergency@example.com",
      fitnessGoals: "General fitness and weight loss",
      joinDate: new Date(),
      createdAt: new Date()
    });
  }
  
  // Create trainer profiles collection
  const trainerProfiles = db.collection('trainerProfiles');
  await trainerProfiles.deleteMany({});
  
  const trainerUser = await users.findOne({ email: "jane.trainer@example.com" });
  if (trainerUser) {
    await trainerProfiles.insertOne({
      userId: trainerUser._id,
      specializations: ["Weight Training", "Cardio", "Nutrition"],
      certifications: "NASM-CPT, Nutrition Specialist",
      experienceYears: 5,
      hourlyRate: 75.00,
      bio: "Experienced personal trainer specializing in weight loss and strength training.",
      isAvailable: true,
      createdAt: new Date()
    });
  }
  
  console.log("MongoDB collections initialized with sample data");
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeMongoDB first.');
  }
  return db;
}

export async function closeMongoDB() {
  if (client) {
    await client.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}
