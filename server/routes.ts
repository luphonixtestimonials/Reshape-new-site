import type { Express } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import { mongoStorage } from "./mongoStorage.js";
// Remove auth temporarily for MongoDB setup  
// import { setupAuth, isAuthenticated } from "./replitAuth";

// Temporary mock for isAuthenticated during MongoDB setup
const isAuthenticated = (req: any, res: any, next: any) => {
  // Skip auth for now during development
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware with secret
  app.use(session({
    secret: 'reshape-fitness-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  
  // Temporarily disable auth for MongoDB setup

  // Test MongoDB connection
  app.get('/api/test-mongo', async (req, res) => {
    try {
      const tiers = await mongoStorage.getMembershipTiers();
      res.json({ 
        message: "External MongoDB connected successfully to gymdata database", 
        tiersCount: tiers.length,
        database: "gymdata",
        host: "localhost:27017",
        testCompleted: true 
      });
    } catch (error) {
      console.error("MongoDB test error:", error);
      res.status(500).json({ message: "MongoDB connection failed", error: error.message });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, location, interest, message } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !location || !interest || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Store contact submission in database
      const contactSubmission = {
        firstName,
        lastName,
        email,
        phone,
        location,
        interest,
        message,
        submittedAt: new Date().toISOString(),
        status: 'new'
      };

      const result = await mongoStorage.storeContactSubmission(contactSubmission);
      
      console.log('Contact form submitted:', { firstName, lastName, email, location, interest });
      
      res.json({ 
        message: "Contact form submitted successfully",
        submissionId: result.insertedId
      });
    } catch (error) {
      console.error("Contact form submission error:", error);
      res.status(500).json({ message: "Failed to submit contact form", error: error.message });
    }
  });

  // Initialize membership tiers
  app.get('/api/init', async (req, res) => {
    try {
      const existingTiers = await mongoStorage.getMembershipTiers();
      if (existingTiers.length === 0) {
        const tiers = [
          {
            name: "Access",
            monthlyPrice: "200.00",
            annualPrice: "2000.00",
            benefits: ["Full gym access", "Group fitness classes", "Locker room amenities", "Basic wellness services"],
            maxGuests: 0,
            personalTrainingIncluded: 0,
          },
          {
            name: "All Access",
            monthlyPrice: "300.00",
            annualPrice: "3000.00",
            benefits: ["Multiple location access", "Personal training sessions", "Spa services included", "Nutrition consultations", "Guest privileges"],
            maxGuests: 2,
            personalTrainingIncluded: 2,
          },
          {
            name: "Executive",
            monthlyPrice: "500.00",
            annualPrice: "5000.00",
            benefits: ["VIP lounge access", "Unlimited personal training", "Concierge services", "Exclusive events", "Priority booking"],
            maxGuests: 5,
            personalTrainingIncluded: 999,
          }
        ];

        for (const tier of tiers) {
          await mongoStorage.createMembershipTier(tier);
        }
      }
      
      res.json({ message: "Initialized successfully" });
    } catch (error) {
      console.error("Error initializing:", error);
      res.status(500).json({ message: "Failed to initialize" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011'; // Mock user ID for testing
      const user = await mongoStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get additional profile data based on user type
      let profileData = null;
      if (user?.userType === 'member') {
        profileData = await mongoStorage.getMemberProfile(userId);
      } else if (user?.userType === 'trainer') {
        profileData = await mongoStorage.getTrainerProfile(userId);
      }

      res.json({ ...user, profileData });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Membership tiers
  app.get('/api/membership-tiers', async (req, res) => {
    try {
      const tiers = await mongoStorage.getMembershipTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching membership tiers:", error);
      res.status(500).json({ message: "Failed to fetch membership tiers" });
    }
  });

  // Create member profile (auth disabled for MongoDB setup)
  app.post('/api/member-profile', async (req: any, res) => {
    try {
      const userId = req.body.userId; // Temporarily get from body
      const profileData = {
        ...req.body,
        userId
      };

      const profile = await mongoStorage.createMemberProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating member profile:", error);
      res.status(500).json({ message: "Failed to create member profile" });
    }
  });

  // Create trainer profile
  app.post('/api/trainer-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const profileData = {
        ...req.body,
        userId
      };

      const profile = await mongoStorage.createTrainerProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating trainer profile:", error);
      res.status(500).json({ message: "Failed to create trainer profile" });
    }
  });

  // Get trainers
  app.get('/api/trainers', isAuthenticated, async (req, res) => {
    try {
      const trainers = await mongoStorage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Training sessions
  app.get('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);
      
      let sessions = [];
      if (user?.userType === 'member') {
        const memberProfile = await mongoStorage.getMemberProfile(userId);
        if (memberProfile) {
          sessions = await mongoStorage.getTrainingSessionsByMember(memberProfile._id.toString());
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await mongoStorage.getTrainerProfile(userId);
        if (trainerProfile) {
          sessions = await mongoStorage.getTrainingSessionsByTrainer(trainerProfile._id.toString());
        }
      }

      res.json(sessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ message: "Failed to fetch training sessions" });
    }
  });

  // Create training session
  app.post('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const session = await mongoStorage.createTrainingSession(req.body);
      res.json(session);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ message: "Failed to create training session" });
    }
  });

  // Workout plans
  app.get('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);
      
      let plans = [];
      if (user?.userType === 'member') {
        const memberProfile = await mongoStorage.getMemberProfile(userId);
        if (memberProfile) {
          plans = await mongoStorage.getWorkoutPlansByMember(memberProfile._id.toString());
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await mongoStorage.getTrainerProfile(userId);
        if (trainerProfile) {
          plans = await mongoStorage.getWorkoutPlansByTrainer(trainerProfile._id.toString());
        }
      }

      res.json(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  // Create workout plan
  app.post('/api/workout-plans', isAuthenticated, async (req: any, res) => {
    try {
      const plan = await mongoStorage.createWorkoutPlan(req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Nutrition plans
  app.get('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);
      
      let plans = [];
      if (user?.userType === 'member') {
        const memberProfile = await mongoStorage.getMemberProfile(userId);
        if (memberProfile) {
          plans = await mongoStorage.getNutritionPlansByMember(memberProfile._id.toString());
        }
      } else if (user?.userType === 'trainer') {
        const trainerProfile = await mongoStorage.getTrainerProfile(userId);
        if (trainerProfile) {
          plans = await mongoStorage.getNutritionPlansByTrainer(trainerProfile._id.toString());
        }
      }

      res.json(plans);
    } catch (error) {
      console.error("Error fetching nutrition plans:", error);
      res.status(500).json({ message: "Failed to fetch nutrition plans" });
    }
  });

  // Create nutrition plan
  app.post('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const plan = await mongoStorage.createNutritionPlan(req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error creating nutrition plan:", error);
      res.status(500).json({ message: "Failed to create nutrition plan" });
    }
  });

  // Admin routes
  app.get('/api/admin/members', async (req, res) => {
    try {
      const members = await mongoStorage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get('/api/admin/trainers', async (req, res) => {
    try {
      const trainers = await mongoStorage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await mongoStorage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.post('/api/admin/create-member', async (req, res) => {
    try {
      const { firstName, lastName, email, membershipTierId, phone, emergencyContact, fitnessGoals } = req.body;
      
      if (!firstName || !lastName || !email || !membershipTierId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newUser = await mongoStorage.createUser({
        email,
        firstName,
        lastName,
        userType: 'member',
        phone: phone || null
      });

      const memberProfile = await mongoStorage.createMemberProfile({
        userId: newUser._id.toString(),
        membershipTierId,
        emergencyContact: emergencyContact || email,
        fitnessGoals: fitnessGoals || "General fitness improvement"
      });

      res.json({ user: newUser, profile: memberProfile });
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ message: error.message || "Failed to create member" });
    }
  });

  app.post('/api/admin/create-trainer', async (req, res) => {
    try {
      const { firstName, lastName, email, specializations, hourlyRate, experienceYears, certifications, bio } = req.body;
      
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newUser = await mongoStorage.createUser({
        email,
        firstName,
        lastName,
        userType: 'trainer'
      });

      const trainerProfile = await mongoStorage.createTrainerProfile({
        userId: newUser._id.toString(),
        specializations: specializations || [],
        hourlyRate: hourlyRate || "75.00",
        experienceYears: experienceYears || 2,
        certifications: certifications || "",
        bio: bio || "",
        isAvailable: true
      });

      res.json({ user: newUser, profile: trainerProfile });
    } catch (error: any) {
      console.error("Error creating trainer:", error);
      res.status(500).json({ message: error.message || "Failed to create trainer" });
    }
  });

  app.delete('/api/admin/delete-member/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await mongoStorage.deleteUser(userId);
      res.json({ message: "Member deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: error.message || "Failed to delete member" });
    }
  });

  app.delete('/api/admin/delete-trainer/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await mongoStorage.deleteUser(userId);
      res.json({ message: "Trainer deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting trainer:", error);
      res.status(500).json({ message: error.message || "Failed to delete trainer" });
    }
  });

  // Static membership subscription endpoint
  app.post('/api/create-membership', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || '507f1f77bcf86cd799439011';
      const user = await mongoStorage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: { message: "User not found" } });
      }

      const { membershipTierId } = req.body;
      if (!membershipTierId) {
        return res.status(400).json({ error: { message: 'Membership tier ID is required' } });
      }

      const membershipTier = await mongoStorage.getMembershipTier(membershipTierId);
      if (!membershipTier) {
        return res.status(400).json({ error: { message: 'Invalid membership tier' } });
      }

      let memberProfile = await mongoStorage.getMemberProfile(userId);
      if (!memberProfile) {
        memberProfile = await mongoStorage.createMemberProfile({
          userId,
          membershipTierId,
          fitnessGoals: "Transform my fitness journey",
          emergencyContact: user.email || "",
        });
      }

      const subscriptionId = `sub_${Date.now()}`;

      const subscription = await mongoStorage.createSubscription({
        id: subscriptionId,
        memberId: memberProfile._id.toString(),
        membershipTierId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        autoRenew: true,
      });

      res.json({
        success: true,
        message: "Membership activated successfully!",
        subscriptionId,
        membershipTier: membershipTier.name,
      });
    } catch (error: any) {
      console.error("Membership creation error:", error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
