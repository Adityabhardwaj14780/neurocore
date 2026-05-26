import mongoose, { Document } from 'mongoose';
import Message from './Message';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new mongoose.Schema<IConversation>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);