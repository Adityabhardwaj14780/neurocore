import User from '../models/User';
import { Request, Response } from 'express';

const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const dashboardData = {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan
      },
      usage: {
        apiCalls: user.usage.apiCalls,
        lastLogin: user.usage.lastLogin
      },
      subscription: {
        plan: user.subscriptionPlan,
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    };

    res.json({ success: true, data: { dashboardData } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { subscriptionPlan: plan },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Subscription updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  getDashboardData,
  updateSubscription
};