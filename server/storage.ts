import { db, pool } from "../db/index.js";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { eq, desc, ilike, and } from "drizzle-orm";
import * as schema from "../shared/schema.js";
import type { Post, InsertPost, Subscriber, Contact, User } from "../shared/schema.js";

// Session store setup with PostgreSQL
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: Omit<schema.InsertUser, "id">): Promise<User>;
  
  getAllPosts(search?: string, category?: string): Promise<Post[]>;
  getFeaturedPosts(): Promise<Post[]>;
  getRecentPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: Omit<InsertPost, "id" | "createdAt">): Promise<Post>;
  updatePost(id: number, post: Partial<Omit<InsertPost, "id" | "createdAt">>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  addSubscriber(email: string): Promise<Subscriber>;
  saveContactForm(data: Omit<Contact, "id" | "createdAt" | "read">): Promise<Contact>;
  
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // The "session" table is created by db/setup.ts (createTableIfMissing reads
    // a SQL file from node_modules, which isn't bundled into the Vercel function)
    this.sessionStore = new PostgresSessionStore({
      pool: pool as any,
      tableName: "session",
    });
  }

  // User operations
  async getUser(id: number): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async createUser(user: Omit<schema.InsertUser, "id">): Promise<User> {
    const [newUser] = await db.insert(schema.users)
      .values(user)
      .returning();
      
    return newUser;
  }

  async updateUser(id: number, data: { bio?: string; image?: string }): Promise<User> {
    const [updatedUser] = await db.update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  // Post operations
  async getAllPosts(search?: string, category?: string): Promise<Post[]> {
    // Content is encrypted at rest, so search matches titles only
    const conditions = [];
    if (search) {
      conditions.push(ilike(schema.posts.title, `%${search}%`));
    }
    if (category && category !== "all") {
      conditions.push(eq(schema.posts.category, category));
    }

    return await db.select()
      .from(schema.posts)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(schema.posts.createdAt));
  }

  async getFeaturedPosts(): Promise<Post[]> {
    // For this demo, we'll get the latest 3 posts as featured
    // In a real app, you might have a "featured" flag on posts
    return await db.select()
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt))
      .limit(3);
  }

  async getRecentPosts(): Promise<Post[]> {
    // Get the latest posts
    return await db.select()
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt))
      .limit(3);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return await db.query.posts.findFirst({
      where: eq(schema.posts.id, id)
    });
  }

  async createPost(post: Omit<InsertPost, "id" | "createdAt">): Promise<Post> {
    const [newPost] = await db.insert(schema.posts)
      .values(post)
      .returning();
      
    return newPost;
  }

  async updatePost(id: number, post: Partial<Omit<InsertPost, "id" | "createdAt">>): Promise<Post> {
    const [updatedPost] = await db.update(schema.posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(schema.posts.id, id))
      .returning();
      
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(schema.posts)
      .where(eq(schema.posts.id, id));
  }

  // Newsletter subscription
  async addSubscriber(email: string): Promise<Subscriber> {
    // Check if the email already exists
    const existing = await db.query.subscribers.findFirst({
      where: eq(schema.subscribers.email, email)
    });
    
    if (existing) {
      return existing;
    }
    
    const [newSubscriber] = await db.insert(schema.subscribers)
      .values({ email })
      .returning();
      
    return newSubscriber;
  }

  // Contact form
  async saveContactForm(data: Omit<Contact, "id" | "createdAt" | "read">): Promise<Contact> {
    const [contact] = await db.insert(schema.contacts)
      .values(data)
      .returning();
      
    return contact;
  }
}

// Initialize and export the storage instance
export const storage = new DatabaseStorage();
