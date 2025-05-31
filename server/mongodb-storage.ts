import session from "express-session";
import { 
  User, IUser, 
  Post, IPost, 
  Subscriber, ISubscriber, 
  Contact, IContact, 
  InsertUser, InsertPost, InsertSubscriber, InsertContact
} from "@shared/mongodb-schema";
import { connectDB } from "../db/mongodb";
import { Types } from "mongoose";
import MongoStore from "connect-mongo";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser>;
  getUserByEmail(encryptedEmail: string): Promise<IUser | null>;
  getUserByUsername(encryptedUsername: string): Promise<IUser | null>;
  createUser(user: Omit<InsertUser, "id">): Promise<IUser>;
  updateUser(id: string, data: { bio?: string; image?: string }): Promise<IUser>;
  
  // Post methods
  getAllPosts(search?: string, category?: string): Promise<IPost[]>;
  getFeaturedPosts(): Promise<IPost[]>;
  getRecentPosts(): Promise<IPost[]>;
  getPostById(id: string): Promise<IPost | null>;
  createPost(post: Omit<InsertPost, "id" | "createdAt">): Promise<IPost>;
  updatePost(id: string, post: Partial<Omit<InsertPost, "id" | "createdAt">>): Promise<IPost>;
  deletePost(id: string): Promise<void>;
  
  // Subscriber and contact methods
  addSubscriber(email: string): Promise<ISubscriber>;
  saveContactForm(data: Omit<InsertContact, "id" | "createdAt">): Promise<IContact>;
  
  // Session store
  sessionStore: session.Store;
}

// MongoDB implementation of the storage interface
export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Connect to MongoDB
    connectDB();
    
    // Create session store
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_blog',
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: 'native', // Default
    });
  }
  
  // User methods
  async getUser(id: string): Promise<IUser> {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }
  
  async getUserByEmail(encryptedEmail: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: encryptedEmail });
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }
  
  async getUserByUsername(encryptedUsername: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username: encryptedUsername });
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }
  
  async createUser(user: Omit<InsertUser, "id">): Promise<IUser> {
    try {
      const newUser = new User(user);
      await newUser.save();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUser(id: string, data: { bio?: string; image?: string }): Promise<IUser> {
    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    if (!updatedUser) throw new Error(`User with id ${id} not found`);
    return updatedUser;
  }
  
  // Post methods
  async getAllPosts(search?: string, category?: string): Promise<IPost[]> {
    try {
      let query = Post.find();
      
      if (search) {
        query = query.or([
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]);
      }
      
      if (category && category !== 'all') {
        query = query.where({ category });
      }
      
      return await query.sort({ createdAt: -1 }).exec();
    } catch (error) {
      console.error("Error getting all posts:", error);
      throw error;
    }
  }
  
  async getFeaturedPosts(): Promise<IPost[]> {
    try {
      return await Post.find({ featured: true }).sort({ createdAt: -1 }).limit(6).exec();
    } catch (error) {
      console.error("Error getting featured posts:", error);
      throw error;
    }
  }
  
  async getRecentPosts(): Promise<IPost[]> {
    try {
      return await Post.find().sort({ createdAt: -1 }).limit(5).exec();
    } catch (error) {
      console.error("Error getting recent posts:", error);
      throw error;
    }
  }
  
  async getPostById(id: string): Promise<IPost | null> {
    try {
      return await Post.findById(id);
    } catch (error) {
      console.error("Error getting post by id:", error);
      throw error;
    }
  }
  
  async createPost(post: Omit<InsertPost, "id" | "createdAt">): Promise<IPost> {
    try {
      const newPost = new Post({
        ...post,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newPost.save();
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
  
  async updatePost(id: string, post: Partial<Omit<InsertPost, "id" | "createdAt">>): Promise<IPost> {
    try {
      const updatedPost = await Post.findByIdAndUpdate(
        id, 
        { ...post, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      );
      
      if (!updatedPost) {
        throw new Error(`Post with id ${id} not found`);
      }
      
      return updatedPost;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }
  
  async deletePost(id: string): Promise<void> {
    try {
      const result = await Post.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`Post with id ${id} not found`);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }
  
  // Subscriber methods
  async addSubscriber(email: string): Promise<ISubscriber> {
    try {
      // Check if subscriber already exists
      const existingSubscriber = await Subscriber.findOne({ email });
      if (existingSubscriber) {
        if (!existingSubscriber.active) {
          existingSubscriber.active = true;
          await existingSubscriber.save();
        }
        return existingSubscriber;
      }
      
      // Create new subscriber
      const newSubscriber = new Subscriber({ email });
      await newSubscriber.save();
      return newSubscriber;
    } catch (error) {
      console.error("Error adding subscriber:", error);
      throw error;
    }
  }
  
  // Contact form methods
  async saveContactForm(data: Omit<InsertContact, "id" | "createdAt">): Promise<IContact> {
    try {
      const newContact = new Contact(data);
      await newContact.save();
      return newContact;
    } catch (error) {
      console.error("Error saving contact form:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const mongoStorage = new MongoDBStorage();