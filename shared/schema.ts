import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: text("role").default("user").notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
}).omit({ id: true, createdAt: true, role: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(), // This will be encrypted
  summary: text("summary"), // This will be encrypted
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  authorId: integer("author_id").references(() => users.id).notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  featured: boolean("featured").default(false),
});

export const insertPostSchema = createInsertSchema(posts, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  content: (schema) => schema.min(50, "Content must be at least 50 characters"),
  imageUrl: (schema) => schema.url("Please enter a valid URL"),
  category: (schema) => schema.min(1, "Please select a category"),
  summary: (schema) => schema.min(10, "Summary must be at least 10 characters").max(200, "Summary must be less than 200 characters").optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Relations between posts and users
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// Subscribers table for newsletter
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(), // This will be encrypted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true),
});

export const insertSubscriberSchema = createInsertSchema(subscribers, {
  email: (schema) => schema.email("Please enter a valid email address"),
}).omit({ id: true, createdAt: true, active: true });

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// Contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // This will be encrypted
  email: text("email").notNull(), // This will be encrypted
  subject: text("subject").notNull(), // This will be encrypted
  message: text("message").notNull(), // This will be encrypted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false),
});

export const insertContactSchema = createInsertSchema(contacts, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email address"),
  subject: (schema) => schema.min(5, "Subject must be at least 5 characters"),
  message: (schema) => schema.min(10, "Message must be at least 10 characters"),
}).omit({ id: true, createdAt: true, read: true });

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
