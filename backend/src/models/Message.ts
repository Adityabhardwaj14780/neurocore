import mongoose, { Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: 'user' | 'assistant';
  conversationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMessage>('Message', MessageSchema);