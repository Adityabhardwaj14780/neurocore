import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import { Request, Response } from 'express';

const chat = async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    // Find or create conversation
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({ userId });
      await conversation.save();
    }

    // Save user message
    const userMessage = new Message({
      content: message,
      sender: 'user',
      conversationId: conversation._id
    });
    await userMessage.save();

    // Add to conversation
    conversation.messages.push(userMessage._id);
    await conversation.save();

    // Simulate AI response (in production, this would call actual AI API)
    const aiResponse = {
      content: `AI response to: "${message}"`,
      sender: 'assistant',
      conversationId: conversation._id
    };

    const aiMessage = new Message(aiResponse);
    await aiMessage.save();

    conversation.messages.push(aiMessage._id);
    await conversation.save();

    // Update user usage
    await User.findByIdAndUpdate(userId, { $inc: { 'usage.apiCalls': 1 } });

    res.json({
      success: true,
      message: 'Message processed',
      data: {
        userMessage,
        aiResponse: aiMessage.content,
        conversationId: conversation._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getConversation = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId)
      .populate('messages')
      .exec();

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: { conversation } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .populate('messages')
      .exec();

    res.json({ success: true, data: { conversations } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  chat,
  getConversation,
  getConversations
};