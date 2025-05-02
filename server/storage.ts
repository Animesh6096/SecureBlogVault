import { db } from "@db";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "@db";
import { eq, desc, and, like, or } from "drizzle-orm";
import * as schema from "@shared/schema";
import { Post, InsertPost, Subscriber, Contact, User } from "@shared/schema";

// Session store setup with PostgreSQL
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<schema.InsertUser, "id">): Promise<User>;
  
  getAllPosts(search?: string, category?: string): Promise<Post[]>;
  getFeaturedPosts(): Promise<Post[]>;
  getRecentPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(post: Omit<InsertPost, "id" | "createdAt">): Promise<Post>;
  updatePost(id: number, post: Partial<Omit<InsertPost, "id" | "createdAt">>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  addSubscriber(email: string): Promise<Subscriber>;
  saveContactForm(data: Omit<Contact, "id" | "createdAt">): Promise<Contact>;
  
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
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
    // Case insensitive search for username
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    
    return user;
  }

  async createUser(user: Omit<schema.InsertUser, "id">): Promise<User> {
    const [newUser] = await db.insert(schema.users)
      .values(user)
      .returning();
      
    return newUser;
  }

  // Post operations
  async getAllPosts(search?: string, category?: string): Promise<Post[]> {
    let query = db.select().from(schema.posts);
    
    // Apply filters if provided
    if (search) {
      query = query.where(
        or(
          like(schema.posts.title, `%${search}%`),
          like(schema.posts.content, `%${search}%`)
        )
      );
    }
    
    if (category && category !== "all") {
      query = query.where(eq(schema.posts.category, category));
    }
    
    // Order by creation date, newest first
    query = query.orderBy(desc(schema.posts.createdAt));
    
    return await query;
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
      .values({
        ...post,
        createdAt: new Date().toISOString(),
      })
      .returning();
      
    return newPost;
  }

  async updatePost(id: number, post: Partial<Omit<InsertPost, "id" | "createdAt">>): Promise<Post> {
    const [updatedPost] = await db.update(schema.posts)
      .set(post)
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
      .values({
        email,
        createdAt: new Date().toISOString(),
      })
      .returning();
      
    return newSubscriber;
  }

  // Contact form
  async saveContactForm(data: Omit<Contact, "id" | "createdAt">): Promise<Contact> {
    const [contact] = await db.insert(schema.contacts)
      .values({
        ...data,
        createdAt: new Date().toISOString(),
      })
      .returning();
      
    return contact;
  }
}

// Initialize and export the storage instance
export const storage = new DatabaseStorage();
