import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// User Schema
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

// Post Schema
export interface IPost extends Document {
  title: string;
  content: string;
  summary?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  authorId: Schema.Types.ObjectId;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
  featured: boolean;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true }, // This will be encrypted
  summary: { type: String }, // This will be encrypted
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  featured: { type: Boolean, default: false }
});

// Subscriber Schema
export interface ISubscriber extends Document {
  email: string; // This will be encrypted
  createdAt: Date;
  active: boolean;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, unique: true }, // This will be encrypted
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

// Contact Schema
export interface IContact extends Document {
  name: string; // This will be encrypted
  email: string; // This will be encrypted
  subject: string; // This will be encrypted
  message: string; // This will be encrypted
  createdAt: Date;
  read: boolean;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true }, // This will be encrypted
  email: { type: String, required: true }, // This will be encrypted
  subject: { type: String, required: true }, // This will be encrypted
  message: { type: String, required: true }, // This will be encrypted
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

// Zod Validation Schemas
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'admin']).optional().default('user')
});

export const insertPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(200, "Summary must be less than 200 characters").optional(),
  imageUrl: z.string().url("Please enter a valid URL"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).optional().default([]),
  authorId: z.string(),
  author: z.string()
});

export const insertSubscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export const insertContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

// Types for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Export mongoose models
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
export const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
export const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);