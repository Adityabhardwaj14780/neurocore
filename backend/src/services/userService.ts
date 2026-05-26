import User from '../models/User';

const getUserById = async (id: string) => {
  return await User.findById(id).select('-password');
};

const updateUserUsage = async (userId: string, apiCalls: number) => {
  return await User.findByIdAndUpdate(
    userId,
    { $inc: { 'usage.apiCalls': apiCalls } },
    { new: true }
  );
};

const updateLastLogin = async (userId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { 'usage.lastLogin': new Date() },
    { new: true }
  );
};

const updateSubscription = async (userId: string, plan: 'free' | 'pro' | 'enterprise') => {
  return await User.findByIdAndUpdate(
    userId,
    { subscriptionPlan: plan },
    { new: true }
  );
};

export default {
  getUserById,
  updateUserUsage,
  updateLastLogin,
  updateSubscription
};