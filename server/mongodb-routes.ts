import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupMongoDBAuth } from "./mongodb-auth";
import { mongoStorage } from "./mongodb-storage";
import { encryptData, decryptData } from "./encryption";

export async function registerMongoDBRoutes(app: Express): Promise<Server> {
  // Setup authentication routes using MongoDB
  setupMongoDBAuth(app);

  // API Routes
  // Get featured posts
  app.get("/api/posts/featured", async (req, res) => {
    try {
      const posts = await mongoStorage.getFeaturedPosts();
      
      // Decrypt post content before sending to client
      const decryptedPosts = posts.map(post => ({
        ...post.toObject(),
        content: decryptData(post.content),
        summary: post.summary ? decryptData(post.summary) : ""
      }));
      
      res.json(decryptedPosts);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      res.status(500).json({ message: "Failed to fetch featured posts" });
    }
  });

  // Get recent posts
  app.get("/api/posts/recent", async (req, res) => {
    try {
      const posts = await mongoStorage.getRecentPosts();
      
      // Decrypt post content before sending to client
      const decryptedPosts = posts.map(post => ({
        ...post.toObject(),
        content: decryptData(post.content),
        summary: post.summary ? decryptData(post.summary) : ""
      }));
      
      res.json(decryptedPosts);
    } catch (error) {
      console.error("Error fetching recent posts:", error);
      res.status(500).json({ message: "Failed to fetch recent posts" });
    }
  });

  // Get all posts (with optional filtering)
  app.get("/api/posts", async (req, res) => {
    try {
      const { search, category } = req.query;
      const posts = await mongoStorage.getAllPosts(
        typeof search === "string" ? search : undefined,
        typeof category === "string" ? category : undefined
      );
      
      // Decrypt post content before sending to client
      const decryptedPosts = posts.map(post => ({
        ...post.toObject(),
        content: decryptData(post.content),
        summary: post.summary ? decryptData(post.summary) : ""
      }));
      
      res.json(decryptedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get a single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await mongoStorage.getPostById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Decrypt post content before sending to client
      const decryptedPost = {
        ...post.toObject(),
        content: decryptData(post.content),
        summary: post.summary ? decryptData(post.summary) : ""
      };
      
      res.json(decryptedPost);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create a new post (protected route - requires authentication)
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { title, content, imageUrl, category, tags, summary } = req.body;
      
      // Encrypt post content before storing
      const encryptedContent = encryptData(content);
      const encryptedSummary = summary ? encryptData(summary) : "";
      
      const post = await mongoStorage.createPost({
        title,
        content: encryptedContent,
        summary: encryptedSummary,
        imageUrl,
        category,
        tags,
        authorId: req.user.id,
        author: req.user.username
      });
      
      // Decrypt for the response
      const decryptedPost = {
        ...post.toObject(),
        content: decryptData(post.content),
        summary: post.summary ? decryptData(post.summary) : ""
      };
      
      res.status(201).json(decryptedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Update a post (protected route)
  app.put("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = req.params.id;
      const post = await mongoStorage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if the user is the author of the post
      if (post.authorId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { title, content, imageUrl, category, tags, summary } = req.body;
      
      // Encrypt updated content
      const encryptedContent = encryptData(content);
      const encryptedSummary = summary ? encryptData(summary) : "";
      
      const updatedPost = await mongoStorage.updatePost(postId, {
        title,
        content: encryptedContent,
        summary: encryptedSummary,
        imageUrl,
        category,
        tags
      });
      
      // Decrypt for the response
      const decryptedPost = {
        ...updatedPost.toObject(),
        content: decryptData(updatedPost.content),
        summary: updatedPost.summary ? decryptData(updatedPost.summary) : ""
      };
      
      res.json(decryptedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete a post (protected route)
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = req.params.id;
      const post = await mongoStorage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if the user is the author of the post
      if (post.authorId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await mongoStorage.deletePost(postId);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Newsletter subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Encrypt email before storing
      const encryptedEmail = encryptData(email);
      
      const subscriber = await mongoStorage.addSubscriber(encryptedEmail);
      res.status(201).json({ message: "Subscription successful" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Encrypt contact data before storing
      const encryptedData = {
        name: encryptData(name),
        email: encryptData(email),
        subject: encryptData(subject),
        message: encryptData(message)
      };
      
      await mongoStorage.saveContactForm(encryptedData);
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}