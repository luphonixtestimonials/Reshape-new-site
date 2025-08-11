import { ObjectId } from 'mongodb';
import { getDB } from './mongodb.js';

export class MongoStorage {
  private get db() {
    return getDB();
  }

  // Users
  async createUser(userData: any) {
    const users = this.db.collection('users');
    const result = await users.insertOne({
      ...userData,
      createdAt: new Date()
    });
    return await users.findOne({ _id: result.insertedId });
  }

  async getUser(userId: string) {
    const users = this.db.collection('users');
    return await users.findOne({ _id: new ObjectId(userId) });
  }

  async getUserByEmail(email: string) {
    const users = this.db.collection('users');
    return await users.findOne({ email });
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string) {
    const users = this.db.collection('users');
    return await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          updatedAt: new Date()
        }
      }
    );
  }

  // Membership Tiers
  async getMembershipTiers() {
    const tiers = this.db.collection('membershipTiers');
    return await tiers.find({}).toArray();
  }

  async getMembershipTier(tierId: string) {
    const tiers = this.db.collection('membershipTiers');
    return await tiers.findOne({ _id: new ObjectId(tierId) });
  }

  async createMembershipTier(tierData: any) {
    const tiers = this.db.collection('membershipTiers');
    const result = await tiers.insertOne({
      ...tierData,
      createdAt: new Date()
    });
    return await tiers.findOne({ _id: result.insertedId });
  }

  // Member Profiles
  async getMemberProfile(userId: string) {
    const profiles = this.db.collection('memberProfiles');
    return await profiles.findOne({ userId: new ObjectId(userId) });
  }

  async createMemberProfile(profileData: any) {
    const profiles = this.db.collection('memberProfiles');
    const result = await profiles.insertOne({
      ...profileData,
      userId: new ObjectId(profileData.userId),
      membershipTierId: profileData.membershipTierId ? new ObjectId(profileData.membershipTierId) : null,
      createdAt: new Date()
    });
    return await profiles.findOne({ _id: result.insertedId });
  }

  async updateMemberProfile(userId: string, updates: any) {
    const profiles = this.db.collection('memberProfiles');
    return await profiles.updateOne(
      { userId: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  // Trainer Profiles
  async getTrainerProfile(userId: string) {
    const profiles = this.db.collection('trainerProfiles');
    return await profiles.findOne({ userId: new ObjectId(userId) });
  }

  async getTrainerProfiles() {
    const profiles = this.db.collection('trainerProfiles');
    const users = this.db.collection('users');

    const trainers = await profiles.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]).toArray();

    return trainers;
  }

  async createTrainerProfile(profileData: any) {
    const profiles = this.db.collection('trainerProfiles');
    const result = await profiles.insertOne({
      ...profileData,
      userId: new ObjectId(profileData.userId),
      createdAt: new Date()
    });
    return await profiles.findOne({ _id: result.insertedId });
  }

  // Training Sessions
  async createTrainingSession(sessionData: any) {
    const sessions = this.db.collection('trainingSessions');
    const result = await sessions.insertOne({
      ...sessionData,
      memberId: new ObjectId(sessionData.memberId),
      trainerId: new ObjectId(sessionData.trainerId),
      createdAt: new Date()
    });
    return await sessions.findOne({ _id: result.insertedId });
  }

  async getTrainingSessionsByMember(memberId: string) {
    const sessions = this.db.collection('trainingSessions');
    return await sessions.find({ memberId: new ObjectId(memberId) }).toArray();
  }

  async getTrainingSessionsByTrainer(trainerId: string) {
    const sessions = this.db.collection('trainingSessions');
    return await sessions.find({ trainerId: new ObjectId(trainerId) }).toArray();
  }

  // Subscriptions
  async createSubscription(subscriptionData: any) {
    const subscriptions = this.db.collection('subscriptions');
    const result = await subscriptions.insertOne({
      ...subscriptionData,
      memberId: new ObjectId(subscriptionData.memberId),
      membershipTierId: new ObjectId(subscriptionData.membershipTierId),
      createdAt: new Date()
    });
    return await subscriptions.findOne({ _id: result.insertedId });
  }

  async getActiveSubscription(memberId: string) {
    const subscriptions = this.db.collection('subscriptions');
    return await subscriptions.findOne({
      memberId: new ObjectId(memberId),
      isActive: true
    });
  }

  // Workout Plans
  async createWorkoutPlan(planData: any) {
    const plans = this.db.collection('workoutPlans');
    const result = await plans.insertOne({
      ...planData,
      trainerId: new ObjectId(planData.trainerId),
      memberId: new ObjectId(planData.memberId),
      createdAt: new Date()
    });
    return await plans.findOne({ _id: result.insertedId });
  }

  async getWorkoutPlansByMember(memberId: string) {
    const plans = this.db.collection('workoutPlans');
    return await plans.find({ memberId: new ObjectId(memberId) }).toArray();
  }

  // Nutrition Plans
  async createNutritionPlan(planData: any) {
    const plans = this.db.collection('nutritionPlans');
    const result = await plans.insertOne({
      ...planData,
      trainerId: new ObjectId(planData.trainerId),
      memberId: new ObjectId(planData.memberId),
      createdAt: new Date()
    });
    return await plans.findOne({ _id: result.insertedId });
  }

  async getNutritionPlansByMember(memberId: string) {
    const plans = this.db.collection('nutritionPlans');
    return await plans.find({ memberId: new ObjectId(memberId) }).toArray();
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.db.collection('subscriptions').find({ userId }).toArray();
    return subscriptions;
  }

  // Store contact form submission
  async storeContactSubmission(submission: any) {
    const result = await this.db.collection('contact_submissions').insertOne(submission);
    return result;
  }

  // Get contact submissions (for admin use)
  async getContactSubmissions() {
    const submissions = await this.db.collection('contact_submissions').find({}).sort({ submittedAt: -1 }).toArray();
    return submissions;
  }

  // Close database connection
  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

export const mongoStorage = new MongoStorage();