import User from '../models/User';
import { Request, Response } from 'express';

const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, subscriptionPlan } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, subscriptionPlan },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  updateUser,
  deleteUser,
  getAllUsers
};